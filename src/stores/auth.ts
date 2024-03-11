import { userStore } from "./user";
import { observable, computed, type Observable } from "@legendapp/state";

export const authStore = observable({
    accessToken: "",
    refreshToken: "",
    bearerToken: computed((): Observable<string> => {
        return `Bearer ${authStore.accessToken.get()}` as unknown as Observable<string>;
    }),
    loggedIn: computed((): Observable<boolean> => {
        return (userStore.id.get() !== "") as unknown as Observable<boolean>;
    }),
});
