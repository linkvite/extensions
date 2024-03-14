import { sendToBackground } from "@plasmohq/messaging";
import { produce } from "immer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { browser } from "~browser";
import { type ParsedHTML, parseHTML } from "~utils/parser";
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

export function useViewBookmark({ tab, isPopup }: Props) {
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
    const [localData, setLocalData] = useState<ParsedHTML | null>(null);

    const [apiBookmark, setAPIBookmark] = useState<Bookmark>(_bookmark);
    const [localBookmark, setLocalBookmark] = useState<Bookmark>(_bookmark);

    const setAPIView = useCallback((description?: string, image?: string) => {
        setAPIBookmark(prev => {
            const draft = produce(prev, (draft) => {
                draft.meta.url = tab?.url || prev.meta.url;
                draft.info.name = tab?.title || prev.info.name;
                draft.assets.thumbnail = image || apiData?.image || prev.assets.thumbnail;
                draft.info.description = description || apiData?.description || prev.info.description;
            });

            return draft;
        });
    }, [apiData?.description, apiData?.image, tab?.title, tab?.url]);

    const setLocalView = useCallback((description?: string, image?: string) => {
        setLocalBookmark(prev => {
            const draft = produce(prev, (draft) => {
                draft.meta.url = tab?.url || prev.meta.url;
                draft.info.name = tab?.title || prev.info.name;
                draft.assets.thumbnail = image || localData?.image || prev.assets.thumbnail;
                draft.info.description = description || localData?.description || prev.info.description;
            });

            return draft;
        });
    }, [localData?.description, localData?.image, tab?.title, tab?.url]);

    const updateView = useCallback((v: "local" | "api") => {
        v === "local" ? setView("local") : (setView("api"), setAPIView());
    }, [setAPIView]);

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
            const data = await parseHTML(resp.data[0].result);
            setLocalView(data.description, data.image);
            setLocalData(() => produce(data, (draft) => draft));
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

            setExists(true);
            updateView("api");
            setAPIView(data.bookmark.info.description, data.bookmark.assets.thumbnail);
            setAPIBookmark(() => produce(data.bookmark, (draft) => draft));
            setLoading(false);
        };

        fetchCurrentTab();
    }, [autoSave, isPopup, checkExists, fetchFromAPI, fetchFromLocal, setAPIView, tab, updateView]);

    return {
        view,
        exists,
        updateView,
        loading: loading || !tab,
        defaultImage: _bookmark.assets.thumbnail,
        bookmark: view === "api" ? apiBookmark : localBookmark,
        setBookmark: view === "api" ? setAPIBookmark : setLocalBookmark,
    }
}