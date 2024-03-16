import { sendToBackground } from "@plasmohq/messaging";
import { produce } from "immer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { browser } from "~browser";
import { parseHTML } from "~utils/parser";
import type { Bookmark, ParsedLinkData } from "@linkvite/js";
import { makeBookmark } from "~utils";
import type {
    ExistsMessageRequest,
    ExistsMessageResponse
} from "~background/messages/exists";
import type {
    ParseHTMLMessageRequest,
    ParseHTMLMessageResponse
} from "~background/messages/html";
import type {
    ParseMessageRequest,
    ParseMessageResponse
} from "~background/messages/parse";
import toast from "react-hot-toast";
import { useSelector } from "@legendapp/state/react";
import { settingStore } from "~stores";

type Props = {
    tab: browser.Tabs.Tab;
    isPopup?: boolean;
}

type BookmarkItem = {
    data: Bookmark | null;
    type: "local" | "parsed" | "exists";
}

export function useViewBookmark({ tab, isPopup = false }: Props) {
    const { autoSave } = useSelector(settingStore);
    const _bookmark = useMemo(() => {
        const bookmark = makeBookmark();
        const draft = produce(bookmark, (draft) => {
            draft.meta.url = tab?.url;
            draft.info.name = tab?.title || "";
            draft.assets.icon = tab?.favIconUrl || bookmark.assets.icon;
        });

        return draft;
    }, [tab]);

    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"local" | "api">("local");

    const [apiData, setAPIData] = useState<ParsedLinkData | null>(null);
    // const [apiBookmark, setAPIBookmark] = useState<Bookmark>(_bookmark);
    // const [localBookmark, setLocalBookmark] = useState<Bookmark>(_bookmark);

    const [bookmark, setBookmark] = useState<BookmarkItem>({
        type: "local",
        data: _bookmark,
    });

    const updateBookmark = useCallback((data: Bookmark) => {
        setBookmark((prev) => {
            const draft = produce(prev, (draft) => {
                draft.data = data;
            });

            return draft;
        });
    }, []);

    const setAPIView = useCallback((description?: string, image?: string) => {
        setBookmark(prev => {
            const draft = produce(prev, (draft) => {
                draft.type = "parsed";
                draft.data.meta.url = tab?.url || prev.data.meta.url;
                draft.data.info.name = tab?.title || prev.data.info.name;
                draft.data.assets.thumbnail = image || apiData?.image || prev.data.assets.thumbnail;
                draft.data.info.description = description || apiData?.description || prev.data.info.description;
            });

            return draft;
        });
    }, [apiData?.description, apiData?.image, tab?.title, tab?.url]);

    const setLocalView = useCallback((description?: string, image?: string) => {
        setBookmark(prev => {
            const draft = produce(prev, (draft) => {
                draft.type = "local";
                draft.data.meta.url = tab?.url || prev.data.meta.url;
                draft.data.info.name = tab?.title || prev.data.info.name;
                draft.data.assets.thumbnail = image || prev.data.assets.thumbnail;
                draft.data.info.description = description || prev.data.info.description;
            });

            return draft;
        });
    }, [tab?.title, tab?.url]);

    const updateView = useCallback((v: "local" | "api") => {
        v === "local" ? setView("local") : setView("api");
    }, []);

    const fetchFromLocal = useCallback(async (tab: browser.Tabs.Tab) => {
        const resp = await sendToBackground<ParseHTMLMessageRequest, ParseHTMLMessageResponse>({
            name: "html",
            body: { id: tab.id }
        });

        if ('error' in resp) {
            setLocalView();
            toast.error(resp.error);
            return;
        }

        if (resp && resp.data.length > 0) {
            const data = await parseHTML(resp.data[0].result, tab.windowId);
            setLocalView(data.description, data.image);
        }
    }, [setLocalView]);

    const fetchFromAPI = useCallback(async (url: string) => {
        try {
            const resp = await sendToBackground<ParseMessageRequest, ParseMessageResponse>({
                name: "parse",
                body: { url }
            });

            if (resp.data) {
                setAPIView(resp.data.description, resp.data.image);
                setAPIData(() => produce(resp.data, (draft) => draft));
            }
        } catch (error) {
            console.error("Error extracting HTML: ", error);
            toast.error("Error extracting HTML");
        }
    }, [setAPIView]);

    const checkExists = useCallback(async (url: string) => {
        return await sendToBackground<ExistsMessageRequest, ExistsMessageResponse>({
            name: "exists",
            body: { url }
        });
    }, []);

    useEffect(() => {
        if (!tab || (autoSave && isPopup)) return;
        const fetchCurrentTab = async () => {
            const data = await checkExists(tab.url);
            if (!data.exists) {
                await Promise.all([
                    fetchFromLocal(tab),
                    fetchFromAPI(tab.url),
                ]).finally(() => setLoading(false));
                return;
            }

            setBookmark(() => {
                const draft = produce(data.bookmark, (draft) => draft);
                return { data: draft, type: "exists" };
            });

            setExists(true);
            setLoading(false);
        };

        fetchCurrentTab();
    }, [autoSave, checkExists, fetchFromAPI, fetchFromLocal, isPopup, setAPIView, tab, updateView]);

    return {
        view,
        exists,
        updateView,
        updateBookmark,
        bookmark: bookmark.data,
        loading: loading || !tab,
        defaultImage: _bookmark.assets.thumbnail,
    }
}