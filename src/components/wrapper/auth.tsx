import { observer } from "@legendapp/state/react";
import { sendToBackground } from "@plasmohq/messaging";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { InitResponse } from "~background/messages/init";
import { Login } from "~components/auth";
import { authStore, userActions } from "~stores";
import type { AuthResponse } from "~types";
import { extLogout } from "~utils";
import { persistAuthData } from "~utils/storage";

export type OnLogin = (data: AuthResponse) => void;

type AuthCtx = {
	loggedIn: boolean;
	login: OnLogin;
	logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
	loggedIn: false,
	login: () => void 0,
	logout: () => void 0,
});

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within a AuthProvider");
	}

	return ctx;
}

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthProvider = observer(function AuthProvider({
	children,
}: AuthProviderProps) {
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

	const onLogin = useCallback((data: AuthResponse) => {
		persistAuthData(data);
		setLoggedIn(true);
	}, []);

	const onLogout = useCallback(async () => {
		setLoggedIn(false);
		await extLogout();
	}, []);

	const value = useMemo(
		() => ({
			login: onLogin,
			logout: onLogout,
			loggedIn: loggedIn,
		}),
		[loggedIn, onLogin, onLogout],
	);

	if (!loggedIn) {
		return <Login onLogin={onLogin} />;
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});
