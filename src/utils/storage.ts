import { Storage } from "@plasmohq/storage"
export const storage = new Storage();

import type {
    ClassConstructor,
    ObservablePersistLocal
} from "@legendapp/state";
import {
    persistObservable,
    configureObservablePersistence
} from '@legendapp/state/persist';
import { authStore, settingStore, userStore } from "~stores";

interface IPersistOptions {
    pluginLocal: ClassConstructor<ObservablePersistLocal, unknown[]> | undefined
}

/**
 * Persist the state observers to local storage.
 * Important: This should only be called once at the root of the app.
 */
export function persistStateObservers({ pluginLocal }: IPersistOptions = { pluginLocal: undefined }) {
    configureObservablePersistence({
        pluginLocal,
    });

    persistObservable(userStore, { local: "user" });
    persistObservable(settingStore, { local: "settings" });
    persistObservable(authStore.refreshToken, { local: "refreshToken" });
}