import type { Theme } from "~types";
import { observable } from "@legendapp/state";

const defaultProps = {
    hotKeys: [],
    collection: "",
    permissions: [],
    autoSave: false,
    autoClose: true,
    theme: "dark" as Theme,
};

export const settingStore = observable({
    ...defaultProps,
});