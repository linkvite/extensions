import React, {
    useCallback,
    useMemo,
    useContext,
    useState,
    createContext,
} from "react";
import { type User } from "@linkvite/js";
import { observer } from "@legendapp/state/react";
import {
    authStore,
    userActions,
} from "~stores";
import { extLogout } from "~utils";
import { Login } from "~components/auth";

type AuthCtx = {
    loggedIn: boolean;
    logout: () => void;
    login: (user: User, token: string) => void;
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
