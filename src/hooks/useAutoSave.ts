import { closeTab } from "~router";
import { NIL_OBJECT_ID } from "~utils";
import { settingStore } from "~stores";
import type { browser } from "~browser";
import { storage } from "~utils/storage";
import type { Collection } from "@linkvite/js";
import { useSelector } from "@legendapp/state/react";
import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExistsMessageRequest, ExistsMessageResponse } from "~background/messages/exists";
import type { CreateBookmarkRequest, CreateBookmarkResponse } from "~background/messages/link";

/**
 * Hook to auto save a bookmark.
 * 
 * Used only in popup when user has enabled auto save.
 */
export function useAutoSave({ tab }: { tab: browser.Tabs.Tab }) {
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { autoSave, autoClose } = useSelector(settingStore);
    const [status, setStatus] = useState<"loading" | "success" | "error" | "exists">("loading");

    const message = useMemo(() => {
        return status === "loading"
            ? "Saving..." : status === "exists"
                ? "Bookmark already exists" : status === "error"
                    ? error || "An error occurred" : "Saved";
    }, [error, status]);

    const checkExists = useCallback(async (url: string) => {
        return await sendToBackground<ExistsMessageRequest, ExistsMessageResponse>({
            name: "exists",
            body: { url }
        });
    }, []);

    const autoSaveAction = useCallback(async (tab: browser.Tabs.Tab) => {
        const exists = await checkExists(tab.url);
        if (exists.exists) {
            setStatus("exists");
            setUrl(exists.bookmark.meta.url);
            setError("Bookmark already exists");
            return;
        }

        const collection = await storage.get<Collection | undefined>("collection");
        const resp = await sendToBackground<CreateBookmarkRequest, CreateBookmarkResponse>({
            name: "link",
            body: {
                url: tab.url, collection: collection?.id || NIL_OBJECT_ID
            }
        });

        if ('error' in resp) {
            setStatus("error");
            setError(resp.error);
            return;
        }

        setStatus("success");

        if (autoClose) {
            await closeTab();
        }
    }, [autoClose, checkExists]);

    useEffect(() => {
        (async () => {
            if (!autoSave || !tab) return;
            await autoSaveAction(tab);
        })();
    }, [autoSave, autoSaveAction, tab]);

    return {
        url,
        message,
        exists: status === "exists"
    };
}
