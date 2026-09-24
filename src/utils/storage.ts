import type {
	ClassConstructor,
	ObservablePersistLocal,
} from "@legendapp/state";
import {
	configureObservablePersistence,
	persistObservable,
} from "@legendapp/state/persist";
import { Storage } from "@plasmohq/storage";
import { authStore, settingStore, userActions, userStore } from "~stores";
import type { AuthResponse } from "~types";

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

	persistObservable(userStore, { local: "local_user" });
	persistObservable(settingStore, { local: "local_settings" });
	// The refresh token is persisted only in chrome.storage ("token"), shared
	// by popup and worker. A second copy in popup localStorage went stale on
	// every rotation.
}

export async function persistAuthData(data: AuthResponse) {
	// Persist first: the old refresh token is already dead server-side.
	await storage.set("token", data.refresh_token);
	await storage.set("user", data.user);

	userActions.setData(data.user);
	authStore.accessToken.set(data.access_token);
	authStore.refreshToken.set(data.refresh_token);
}
