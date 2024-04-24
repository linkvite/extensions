import type { Theme } from "~types";
import { observable } from "@legendapp/state";

const defaultProps = {
    autoSave: false,
    autoClose: true,
    theme: "dark" as Theme,
    currentPage: "popup" as "popup" | "options" | "image" | "link" | "tabs"
};

export const settingStore = observable({
    ...defaultProps,
});
