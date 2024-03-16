import React, {
    useCallback,
    useMemo,
    useContext,
    useState,
    createContext,
    useEffect,
} from "react";
import { type User } from "@linkvite/js";
import { observer } from "@legendapp/state/react";
import {
    authStore,
    userActions,
} from "~stores";
import { extLogout } from "~utils";
import { Login } from "~components/auth";
import { sendToBackground } from "@plasmohq/messaging";
import type { InitResponse } from "~background/messages/init";

export type OnLogin = (user: User, token: string) => void;

type AuthCtx = {
    loggedIn: boolean;
    login: OnLogin;
    logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
    loggedIn: false,
    login: () => void 0,
    logout: () => void 0,
});

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within a AuthProvider');
    }

    return ctx;
}

type AuthProviderProps = {
    children: React.ReactNode;
}

export const AuthProvider = observer(function AuthProvider({ children }: AuthProviderProps) {
    const _loggedIn = authStore.loggedIn.get();
    const [loggedIn, setLoggedIn] = useState(_loggedIn);

    useEffect(() => {
        async function init() {
            const resp = await sendToBackground<null, InitResponse>({
                name: "init",
            });

            if (resp.loggedIn) {
                userActions.setData(resp.user);
                authStore.refreshToken.set(resp.token);
                setLoggedIn(true);
                return;
            }

            userActions.clearData();
            authStore.refreshToken.set("");
            setLoggedIn(false);
        }

        init();
    }, []);

    const onLogin = useCallback((user: User, token: string) => {
        setLoggedIn(true);
        userActions.setData(user);
        authStore.refreshToken.set(token);
    }, []);

    const onLogout = useCallback(async () => {
        setLoggedIn(false);
        await extLogout();
    }, []);

    const value = useMemo(() => ({
        login: onLogin,
        logout: onLogout,
        loggedIn: loggedIn,
    }), [loggedIn, onLogin, onLogout]);

    if (!loggedIn) {
        return <Login onLogin={onLogin} />
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
});
