import type { Bookmark, Collection, ParsedLinkData } from "@linkvite/js";
import xior, { merge, type XiorError, type XiorResponse } from "xior";
import { authStore, userActions } from "~stores";
import type { AuthResponse, HTTPException } from "~types";
import { API_DOMAIN } from "~utils";
import { persistAuthData, storage } from "~utils/storage";

export const api = xior.create({
	timeout: 10000,
	baseURL: API_DOMAIN,
});

/**
 * Refresh tokens are single-use: each refresh returns a new pair and the old
 * refresh token dies (replaying it >30s later revokes the whole session).
 * The popup and the background worker are separate JS contexts with their own
 * in-memory stores, and MV3 restarts the worker at will, so:
 *   - refresh with the latest token from chrome.storage, not memory;
 *   - run at most one refresh per context at a time;
 *   - persist the new token before anything else can use the old one.
 */
let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
	if (!refreshInFlight) {
		refreshInFlight = (async () => {
			const latest =
				(await storage.get<string>("token")) || authStore.refreshToken.get();
			if (!latest) {
				throw new Error("Session expired: Please log in again.");
			}
			const data = await handleRefreshToken(latest);
			return data.access_token;
		})().finally(() => {
			refreshInFlight = null;
		});
	}
	return refreshInFlight;
}

api.interceptors.response.use(
	(resp) => resp,
	async (error: XiorError) => {
		const status = error?.response?.status;
		const url = error?.request?.url ?? error?.response?.config?.url ?? "";
		const isAuthCall = url.includes("/auth/");
		const request = error?.request as
			| (XiorError["request"] & { _retry?: boolean })
			| undefined;

		if (status !== 401 || isAuthCall || !request || request._retry) {
			return Promise.reject(error);
		}

		request._retry = true;

		let accessToken: string;
		try {
			accessToken = await refreshAccessToken();
		} catch (refreshError) {
			return Promise.reject(refreshError);
		}

		return api.request(
			merge(request, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		);
	},
);

// Read the token at request time (never capture it in a closure: that is how
// stale tokens were being re-applied after every refresh).
api.interceptors.request.use(async (config) => {
	if (
		config.url?.includes("/auth/login") ||
		config.url?.includes("/auth/token/refresh") ||
		config.headers?.Authorization
	) {
		return config;
	}

	const accessToken = authStore.accessToken.get();
	if (!accessToken) {
		return config;
	}

	return merge(config, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
});

export function handleServerError(
	err: HTTPException,
	onError?: (err: string) => void,
	message?: string,
) {
	let errorMessage = "An unknown error occurred. Please try again.";

	if (err?.response?.data?.error) {
		errorMessage = err?.response.data?.error;
	} else {
		errorMessage = err?.message || message || errorMessage;
	}

	if (err?.response?.status === 429) {
		errorMessage = "Too many requests. Please try again later.";
		onError?.(errorMessage);
		return errorMessage;
	}

	if (err?.response?.status === 401) {
		const message = errorMessage || "Session expired: Please log in again.";
		return message;
	}

	if (err?.response?.status === 402) {
		errorMessage =
			"You need a pro subscription to access this feature. Please upgrade your account.";
		onError?.(errorMessage);
		return errorMessage;
	}

	if (err?.response?.status === 413) {
		errorMessage = "File too large. Please try again with a smaller file.";
		onError?.(errorMessage);
		return errorMessage;
	}

	if (err?.response?.status === 502) {
		errorMessage = "Server is down. Please try again later.";
		onError?.(errorMessage);
		return errorMessage;
	}

	onError?.(errorMessage);
	return errorMessage;
}

type HandleAuthProps = {
	body: {
		identifier: string;
		password: string;
	};
};

export async function handleAuthentication({ body }: HandleAuthProps) {
	if (body.password.length < 6) {
		return;
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	async function handleSuccess(res: XiorResponse) {
		const data = res.data.data as AuthResponse;
		await persistAuthData(data);
		return data;
	}

	const endpoint = `/auth/login`;
	return await api.post(endpoint, body).then(handleSuccess).catch(handleError);
}

export async function handleRefreshToken(token?: string) {
	async function handleError(err: HTTPException) {
		const status = err?.response?.status;
		// 4xx = token dead (expired, revoked, or reused): end the local
		// session. Network/5xx errors keep it; a retry within 30s gets the
		// same rotated pair from the server.
		if (status !== undefined && status < 500) {
			await clearLocalSession();
		}
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	async function handleSuccess(res: XiorResponse) {
		const data = res.data.data as AuthResponse;
		await persistAuthData(data);
		return data;
	}

	return await api
		.post(`/auth/token/refresh`, { refresh_token: token })
		.then(handleSuccess)
		.catch(handleError);
}

async function clearLocalSession() {
	await storage.clear();
	await storage.clear(true);
	await storage.removeAll();

	userActions.clearData();
	authStore.accessToken.set("");
	authStore.refreshToken.set("");
}

export async function handleLogout() {
	// Capture before clearing: the server revokes the session these tokens
	// belong to, so they must be sent, not wiped first.
	const accessToken = authStore.accessToken.get();
	const refreshToken =
		(await storage.get<string>("token")) || authStore.refreshToken.get();

	await clearLocalSession();

	if (!accessToken && !refreshToken) {
		return;
	}

	return await api
		.post(
			`/auth/logout`,
			{ refresh_token: refreshToken },
			{
				headers: accessToken
					? { Authorization: `Bearer ${accessToken}` }
					: undefined,
			},
		)
		.catch(handleServerError);
}

export async function handleParseLink({ url }: { url: string }) {
	const endpoint = `/parser?link=${encodeURIComponent(url)}`;

	function handleSuccess(res: XiorResponse) {
		return res.data.data as ParsedLinkData;
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api.post(endpoint).then(handleSuccess).catch(handleError);
}

type BookmarkExistsResponse = {
	exists: boolean;
	bookmark: Bookmark;
};

export async function handleBookmarkExists({
	url,
}: { url: string }): Promise<BookmarkExistsResponse> {
	const endpoint = `/bookmarks/exists`;

	function handleSuccess(res: XiorResponse) {
		return res.data.data as BookmarkExistsResponse;
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api
		.post(endpoint, { url })
		.then(handleSuccess)
		.catch(handleError);
}

export async function handleCreateLinkBookmark({
	url,
	collection,
}: { url: string; collection?: string }) {
	const endpoint = `/bookmarks`;

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api.post(endpoint, { url, collection }).catch(handleError);
}

type UploadProps = {
	tags: string;
	starred?: boolean;
	collection?: string;
	description?: string;
};

export type CreateBookmarkProps = {
	url: string;
	title: string;
	cover: string;
	favicon?: string;
} & UploadProps;

export async function handleCreateBookmark({
	tags,
	collection: c,
	cover,
	...rest
}: CreateBookmarkProps) {
	const endpoint = `/bookmarks/manual`;
	const collection = c !== null ? c : undefined;

	const formData = new FormData();

	if (tags) {
		formData.append("tags", tags);
	}

	if (collection) {
		formData.append("collection", collection);
	}

	if (cover.startsWith("http")) {
		formData.append("cover", cover);
	} else {
		const response = await fetch(cover);
		const blob = await response.blob();
		formData.append("image", blob, "cover.jpg");
	}

	Object.entries(rest).forEach(([key, value]) => {
		formData.append(key, value.toString());
	});

	function handleSuccess(res: XiorResponse) {
		return res.data.data as Bookmark;
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api
		.post(endpoint, formData)
		.then(handleSuccess)
		.catch(handleError);
}

export type FileBookmarkProps = {
	url: string;
	title?: string;
} & UploadProps;

export async function handleCreateFile({
	url,
	tags,
	collection: c,
	...rest
}: FileBookmarkProps) {
	const endpoint = `/bookmarks/file`;
	const collection = c !== null ? c : undefined;

	const formData = new FormData();
	const response = await fetch(url, { mode: "cors" });
	const blob = await response.blob();
	formData.append("file", blob, `File-${Date.now().toString()}`);

	if (tags) {
		formData.append("tags", tags);
	}

	if (collection) {
		formData.append("collection", collection);
	}

	Object.entries(rest).forEach(([key, value]) => {
		formData.append(key, value.toString());
	});

	function handleSuccess(res: XiorResponse) {
		return Promise.resolve(res.data.message as string);
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api
		.post(endpoint, formData)
		.then(handleSuccess)
		.catch(handleError);
}

export async function handleUpdateBookmark({
	bookmark,
}: { bookmark: Bookmark }) {
	const formData = new FormData();
	const endpoint = `/bookmarks/${bookmark.id}`;

	if (bookmark.thumbnail.startsWith("http")) {
		formData.append("cover", bookmark.thumbnail);
	} else {
		const response = await fetch(bookmark.thumbnail);
		const blob = await response.blob();
		formData.append("image", blob, "cover.jpg");
	}

	formData.append("name", bookmark.title);
	if (bookmark.collection_id) {
		formData.append("collection", bookmark.collection_id);
	}

	if (bookmark.description) {
		formData.append("description", bookmark.description);
	}

	if (bookmark.tags) {
		formData.append("tags", bookmark.tags);
	}

	if (bookmark.url) {
		formData.append("url", bookmark.url);
	}

	if (bookmark.type) {
		formData.append("type", bookmark.type);
	}

	if (bookmark.icon) {
		formData.append("favicon", bookmark.icon);
	}

	if (bookmark.allow_comments) {
		formData.append("allow_comments", bookmark.allow_comments.toString());
	}

	if (bookmark.starred) {
		formData.append("starred", bookmark.starred.toString());
	}

	function handleSuccess(res: XiorResponse) {
		return res.data.data as Bookmark;
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api
		.patch(endpoint, formData)
		.then(handleSuccess)
		.catch(handleError);
}

type FindCollectionsProps = {
	query: string;
	limit?: number;
	owner?: string;
};

export async function handleFindCollections({
	query,
	owner,
	limit = 10,
}: FindCollectionsProps) {
	let endpoint = `/search?q=${encodeURIComponent(query)}`;
	endpoint += `&sort=-updated`;
	endpoint += `&limit=${limit}`;
	endpoint += `&public=false`;
	endpoint += `&path=collections`;
	if (owner) {
		endpoint += `&owner=${encodeURIComponent(owner)}`;
	}

	function handleSuccess(res: XiorResponse) {
		return res.data.data.collections as Collection[];
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api.get(endpoint).then(handleSuccess).catch(handleError);
}

export async function handleFindCollection({ id }: { id: string }) {
	const endpoint = `/collections/${id}`;

	function handleSuccess(res: XiorResponse) {
		return res.data.data as Collection;
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api.get(endpoint).then(handleSuccess).catch(handleError);
}

export async function handleCreateCollection({ name }: { name: string }) {
	const endpoint = `/collections/`;

	function handleSuccess(res: XiorResponse) {
		return res.data.data as Collection;
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api
		.post(endpoint, { name })
		.then(handleSuccess)
		.catch(handleError);
}

export type CreateTabBookmarkProps = {
	tabs: {
		url: string;
		title: string;
		tags?: string;
		description?: string;
	}[];
	collection?: string;
};

export async function handleCreateTabBookmarks({
	tabs,
	collection,
}: CreateTabBookmarkProps) {
	const endpoint = `/bookmarks/tabs`;

	const body = {
		tabs,
		collection,
	};

	function handleSuccess(res: XiorResponse) {
		return Promise.resolve(res.data.message as string);
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api.post(endpoint, body).then(handleSuccess).catch(handleError);
}

export async function handleFindBookmarks({
	query,
	limit = 10,
}: { query: string; limit?: number }) {
	let endpoint = `/search?q=${encodeURIComponent(query)}`;
	endpoint += `&sort=-updated`;
	endpoint += `&limit=${limit}`;
	endpoint += `&path=bookmarks`;

	function handleSuccess(res: XiorResponse) {
		return res.data.data.bookmarks as Bookmark[];
	}

	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	return await api.get(endpoint).then(handleSuccess).catch(handleError);
}
