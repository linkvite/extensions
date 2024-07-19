import type {
	ClassConstructor,
	ObservablePersistLocal,
} from "@legendapp/state";
import {
	configureObservablePersistence,
	persistObservable,
} from "@legendapp/state/persist";
import type { User } from "@linkvite/js";
import { Storage } from "@plasmohq/storage";
import { authStore, settingStore, userActions, userStore } from "~stores";

export const storage = new Storage();

type PersistOptions = {
	pluginLocal: ClassConstructor<ObservablePersistLocal, unknown[]> | undefined;
};

/**
 * Persist the state observers to local storage.
 * Important: This should only be called once at the root of the app.
 */
export function persistStateObservers(
	{ pluginLocal }: PersistOptions = { pluginLocal: undefined },
) {
	configureObservablePersistence({
		pluginLocal,
	});

	persistObservable(settingStore, { local: "settings" });
	persistObservable(userStore, { local: "user" });
	persistObservable(authStore.refreshToken, { local: "refreshToken" });
}

type AuthData = {
	user: User;
	refreshToken: string;
	accessToken?: string;
};

export async function persistAuthData(data: AuthData) {
	await storage.set("user", data.user);
	await storage.set("token", data.refreshToken);

	userActions.setData(data.user);
	authStore.refreshToken.set(data.refreshToken);

	if (data.accessToken) {
		authStore.accessToken.set(data.accessToken);
	}
}
