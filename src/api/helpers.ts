import { API_DOMAIN, NIL_OBJECT_ID } from "~utils";
import type { Bookmark, ParsedLinkData } from "@linkvite/js";
import type { AuthResponse, HTTPException } from "~types";
import { authStore, userActions, userStore } from "~stores";
import xior, { merge, XiorError, type XiorResponse } from "xior";
import { persistAuthData, storage } from '~utils/storage';

export const api = xior.create({
    timeout: 10000,
    baseURL: API_DOMAIN,
});

api.interceptors.response.use(resp => resp, async (error: XiorError) => {
    const isInAuth = error.response.config.url?.includes("/auth");
    if (error.response && error.response.status === 401 && !isInAuth) {
        const originalRequest = error.request;

        if (!originalRequest['_retry']) {
            originalRequest['_retry'] = true;

            const refreshToken = authStore.refreshToken.get() || await storage.get("token");
            const resp = await api.post(`${API_DOMAIN}/auth/token/refresh`, { refreshToken });
            const data = resp.data.data as AuthResponse;
            await persistAuthData(data);

            const request = merge(originalRequest, {
                headers: {
                    Authorization: `Bearer ${data.accessToken}`
                }
            });

            return api.request(request);
        }
    }

    return Promise.reject(error);
});

api.interceptors.request.use(async (config) => {
    // if the endpoint is /auth/login, don't add the token.
    if (config.url?.includes("/auth/login")) return config;

    const accessToken = authStore.accessToken.get();
    if (!accessToken) return config;

    return merge(config, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
});

export function handleServerError(err: HTTPException, onError?: (err: string) => void, message?: string) {
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
        errorMessage = "You need a pro subscription to access this feature. Please upgrade your account.";
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
}

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
    return await api
        .post(endpoint, body)
        .then(handleSuccess)
        .catch(handleError);
}

type HandleLogout = {
    token?: string;
    silent?: boolean;
}

export async function handleLogout({ token, silent }: HandleLogout = {}) {
    userActions.clearData();
    authStore.accessToken.set("")
    authStore.refreshToken.set("");

    await storage.remove("user");
    await storage.remove("token");

    if (silent) return;
    const payload = { token, id: userStore.id.get() };
    await api
        .post(`/auth/logout`, payload)
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

    return await api
        .post(endpoint)
        .then(handleSuccess)
        .catch(handleError);
}

type BookmarkExistsResponse = {
    exists: boolean;
    bookmark: Bookmark;
}

export async function handleBookmarkExists({ url }: { url: string }): Promise<BookmarkExistsResponse> {
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

export type CreateBookmarkProps = {
    url: string;
    title: string;
    description?: string;
    tags?: string[];
    favicon?: string;
    cover: string;
    coverType: "default" | "custom";
    collection?: string;
};

export async function handleCreateBookmark({ tags, collection: c, cover, coverType, ...rest }: CreateBookmarkProps) {
    const endpoint = `/bookmarks/manual`;
    const collection = c !== NIL_OBJECT_ID ? c : undefined;

    const formData = new FormData();
    formData.append("cover", cover);
    formData.append("coverType", coverType);

    if (tags) {
        formData.append("tags", tags.join(","));
    }

    if (collection) {
        formData.append("collection", collection);
    }

    if (coverType === "custom") {
        const response = await fetch(cover);
        const blob = await response.blob();
        formData.append("file", blob, "cover.jpg");
    }

    Object.entries(rest).forEach(([key, value]) => {
        formData.append(key, value);
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

export async function handleUpdateBookmark({ bookmark }: { bookmark: Bookmark }) {
    const endpoint = `/bookmarks/${bookmark.id}`;
    const { info, meta, config, assets, tags } = bookmark;
    const collection = info.collection !== NIL_OBJECT_ID
        ? info.collection
        : undefined;

    const body = {
        collection,
        name: info.name,
        description: info.description,
        tags: tags.join(","),
        url: meta.url,
        type: meta.type,
        favIcon: assets.icon,
        image: bookmark.assets.thumbnail,
        allowComments: config.allowComments,
    };

    function handleSuccess(res: XiorResponse) {
        return res.data.data as Bookmark;
    }

    function handleError(err: HTTPException) {
        const error = handleServerError(err);
        return Promise.reject(error);
    }

    return await api
        .patch(endpoint, body)
        .then(handleSuccess)
        .catch(handleError);
}

type CoverProps = {
    id: string;
    cover: string;
    type: "default" | "custom";
}

export async function handleUpdateBookmarkCover({ id, cover, type }: CoverProps) {
    const endpoint = `/bookmarks/${id}/cover`;
    const formData = new FormData();
    formData.append('type', type);
    cover && formData.append('cover', cover);

    if (type === "custom") {
        const response = await fetch(cover);
        const blob = await response.blob();
        formData.append("file", blob, "cover.jpg");
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
        .catch(handleError)
}