import { type User } from '@linkvite/js';
import { observable, batch } from "@legendapp/state";

const userData = {
    id: "",
    name: "",
    email: "",
    avatar: "",
    username: "",
    status: "active",
    verified: false,
    accountType: "free",
    emailVerified: true,
    folderName: "Folder",
    privateAccount: false,
} as User;

export const userStore = observable({
    ...userData
});

/**
 * Load the user data into the store.
 * 
 * @param data - The user data to load.
 */
function setData(data: User) {
    batch(() => {
        userStore.set(data);
    });
}

/**
 * Clear the user data from the store.
 */
function clearData() {
    setData(userData);
}

export const userActions = {
    setData,
    clearData,
};
