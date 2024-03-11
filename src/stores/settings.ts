import type { Theme } from "~types";
import { observable } from "@legendapp/state";

const defaultProps = {
    hotKeys: [],
    copiedLink: "",
    collection: "",
    permissions: [],
    autoSave: false,
    theme: "dark" as Theme,
};

export const settingStore = observable({
    ...defaultProps,
});

/**
 * Set the copied link.
 * 
 * @param {String} link The link to set.
 */
function setCopiedLink(link: string) {
    settingStore.copiedLink.set(link);
}

/**
 * Set the theme.
 * 
 * @param {String} theme The theme to set.
 */
function setTheme(theme: Theme) {
    settingStore.theme.set(theme);
}

export const settingActions = {
    setTheme,
    setCopiedLink,
}
