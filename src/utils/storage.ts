import type {
	ClassConstructor,
	ObservablePersistLocal,
} from "@legendapp/state";
import {
	configureObservablePersistence,
	persistObservable,
} from "@legendapp/state/persist";
import { Storage } from "@plasmohq/storage";
import { merge } from "xior";
import { api } from "~api";
import {
	authStore,
	collectionStore,
	settingStore,
	userActions,
	userStore,
} from "~stores";
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
	persistObservable(collectionStore, { local: "local_collections" });
	persistObservable(authStore.refreshToken, { local: "local_token" });
}

export async function persistAuthData(data: AuthResponse) {
	userActions.setData(data.user);
	authStore.accessToken.set(data.access_token);
	authStore.refreshToken.set(data.refresh_token);

	await storage.set("user", data.user);
	await storage.set("token", data.refresh_token);

	api.interceptors.request.use(async (config) => {
		return merge(config, {
			headers: {
				Authorization: `Bearer ${data.access_token}`,
			},
		});
	});
}
