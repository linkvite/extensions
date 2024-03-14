import { produce } from "immer";
import { closeTab } from "~router";
import { makeBookmark } from "~utils";
import { settingStore } from "~stores";
import type { browser } from "~browser";
import { parseHTML } from "~utils/parser";
import type { Bookmark } from "@linkvite/js";
import type { CreateBookmarkProps } from "~api";
import { useSelector } from "@legendapp/state/react";
import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreateMessageRequest, CreateMessageResponse } from "~background/messages/create";
import type { ExistsMessageRequest, ExistsMessageResponse } from "~background/messages/exists";
import type { ParseHTMLMessageRequest, ParseHTMLMessageResponse } from "~background/messages/html";

/**
 * Hook to auto save a bookmark.
 * 
 * Used only in popup when user has enabled auto save.
 */
export function useAutoSave({ tab }: { tab: browser.Tabs.Tab }) {
    const { autoSave } = useSelector(settingStore);
    const [error, setError] = useState<string | null>(null);
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

    const onCreate = useCallback(async (b: Bookmark) => {
        const data: CreateBookmarkProps = {
            url: b.meta.url,
            title: b.info.name,
            coverType: "default",
            favicon: b.assets.icon,
            cover: b.assets.thumbnail,
            collection: b.info.collection,
            description: b.info.description,
        }

        return await sendToBackground<CreateMessageRequest, CreateMessageResponse>({
            name: "create",
            body: { data }
        });
    }, []);

    const autoSaveAction = useCallback(async (tab: browser.Tabs.Tab) => {
        const exists = await checkExists(tab.url);
        if (exists.exists) {
            setStatus("exists");
            setError("Bookmark already exists");
            return;
        }

        const resp = await sendToBackground<ParseHTMLMessageRequest, ParseHTMLMessageResponse>({
            name: "html",
            body: { id: tab.id }
        });

        if ('error' in resp) {
            setStatus("error");
            setError(resp.error);
            return;
        }

        if (!resp.data || !resp.data.length) {
            setStatus("error");
            setError("No data found");
            return;
        }

        const parsed = await parseHTML(resp.data[0].result);
        const bookmark = produce(makeBookmark(), (draft) => {
            draft.meta.url = tab.url;
            draft.info.name = tab.title;
            draft.assets.icon = tab.favIconUrl || draft.assets.icon;
            draft.assets.thumbnail = parsed.image || draft.assets.thumbnail;
            draft.info.description = parsed.description || draft.info.description;
        });

        const bookmarkResp = await onCreate(bookmark);
        if ('error' in bookmarkResp) {
            setStatus("error");
            setError(bookmarkResp.error);
            return;
        }

        setStatus("success");
        await closeTab();
    }, [checkExists, onCreate]);

    useEffect(() => {
        (async () => {
            if (!autoSave || !tab) return;
            await autoSaveAction(tab);
        })();
    }, [autoSave, autoSaveAction, tab]);

    return { message };
}
