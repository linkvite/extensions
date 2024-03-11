import { API_DOMAIN } from "~utils";
import { type User } from "@linkvite/js";
import { storage } from "~utils/storage";
import type { AuthResponse, HTTPException } from "~types";
import { authStore, userActions, userStore } from "~stores";
import xior, { merge, XiorError, type XiorResponse } from "xior";

export const api = xior.create({
    timeout: 10000,
    baseURL: API_DOMAIN,
});

api.interceptors.response.use(resp => resp, async (error: XiorError) => {
    if (error.response && error.response.status === 401) {
        const originalRequest = error.request;;

        if (!originalRequest['_retry']) {
            originalRequest['_retry'] = true;

            // Attempt to refresh the token
            return api.post(`${API_DOMAIN}/auth/token/refresh`, { refreshToken: authStore.refreshToken.get() })
                .then(res => {
                    const data = handleAuthSuccess(res.data);
                    api.config.headers.Authorization = 'Bearer ' + data.accessToken;
                    merge(originalRequest, { headers: { Authorization: `Bearer ${data.accessToken}` } });
                    return api.request(originalRequest);
                })
                .catch(err => {
                    handleLogout({ silent: true });
                    return Promise.reject(err);
                });
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
    onError: (err: string) => void;
    onLogin: (user: User, token: string) => void;
}

export async function handleAuthentication({ body, onLogin, onError }: HandleAuthProps) {
    if (body.password.length < 6) {
        onError("Password must be at least 6 characters long");
        return;
    }

    function handleError(err: HTTPException) {
        handleServerError(err, onError);
    }

    function handleSuccess(res: XiorResponse) {
        const data = handleAuthSuccess(res);
        onLogin(data.user, data.refreshToken);
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
    callback?: () => void;
}

export async function handleLogout({ token, silent, callback }: HandleLogout = {}) {
    userActions.clearData();
    authStore.accessToken.set("")
    authStore.refreshToken.set("");
    callback?.();

    if (silent) return;
    const payload = { token, id: userStore.id.get() };
    await api
        .post(`/auth/logout`, payload)
        .catch(handleServerError);

}

export function handleAuthSuccess(res: AuthResponse) {
    const { accessToken, refreshToken, user } = res.data.data;

    userActions.setData(user);
    authStore.accessToken.set(accessToken);
    authStore.refreshToken.set(refreshToken);

    storage.set("user", user);
    storage.set("accessToken", accessToken);
    storage.set("refreshToken", refreshToken);

    return res.data.data;
}