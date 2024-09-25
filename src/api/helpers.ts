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

api.interceptors.response.use(
	(resp) => resp,
	async (error: XiorError) => {
		const isInAuth = error.response.config.url?.includes("/auth");
		if (error.response && error.response.status === 401 && !isInAuth) {
			const originalRequest = error.request;

			if (!originalRequest["_retry"]) {
				originalRequest["_retry"] = true;

				let accessToken = "";
				const refreshToken =
					authStore.refreshToken.get() || (await storage.get("token"));

				await handleRefreshToken(refreshToken)
					.then(async (resp) => {
						await persistAuthData(resp);
						accessToken = resp.access_token;
					})
					.catch(() => {
						return Promise.reject("Session expired: Please log in again.");
					});

				const request = merge(originalRequest, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				return api.request(request);
			}
		}

		return Promise.reject(error);
	},
);

api.interceptors.request.use(async (config) => {
	if (
		config.url?.includes("/auth/login") ||
		config.url?.includes("/auth/token/refresh")
	) {
		return config;
	}

	return merge(config, {
		headers: {
			Authorization: authStore.bearerToken.get(),
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
	function handleError(err: HTTPException) {
		const error = handleServerError(err);
		return Promise.reject(error);
	}

	async function handleSuccess(res: XiorResponse) {
		const data = res.data.data as AuthResponse;
		await persistAuthData(data);
		return data;
	}

	return await api
		.post(`auth/token/refresh`, { refresh_token: token })
		.then(handleSuccess)
		.catch(handleError);
}

export async function handleLogout() {
	await storage.clear();
	await storage.clear(true);
	await storage.removeAll();

	userActions.clearData();
	authStore.accessToken.set("");
	authStore.refreshToken.set("");

	return await api
		.post(`${API_DOMAIN}/auth/logout`, {})
		.catch(handleServerError);
}

export async function handleParseLink({ url }: { url: string }) {
	const endpoint = `/parser?link=${url}`;

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
	formData.append("cover", cover);

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

export async function handleGetCollections() {
	const endpoint = `/collections/all`;
	function handleSuccess(res: XiorResponse) {
		return res.data.data as Collection[];
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
	let endpoint = `/search?q=${query}`;
	endpoint += `&sort=-updatedAt`;
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
