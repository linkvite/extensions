import { sendToBackground } from "@plasmohq/messaging";
import { produce } from "immer";
import { useCallback, useEffect, useState } from "react";
import { browser } from "~browser";
import { parseHTML, type ParsedHTML } from "~utils/parser";
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
import { settingStore } from "~stores";
import { useSelector } from "@legendapp/state/react";

type Props = {
    tab: browser.Tabs.Tab;
    setBookmark: (bookmark: Bookmark) => void;
}

export function useViewBookmark({ tab, setBookmark }: Props) {
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"local" | "api">("local");

    const { autoSave } = useSelector(settingStore);
    const [apiData, setAPIData] = useState<ParsedLinkData | null>(null);
    const [localData, setLocalData] = useState<ParsedHTML | null>(null);
    const [coverType, setCoverType] = useState<"default" | "custom">("default");

    const setAPIView = useCallback((description?: string, image?: string) => {
        const data = produce(makeBookmark(), (draft) => {
            draft.meta.url = tab?.url || draft.meta.url;
            draft.info.name = tab?.title || draft.info.name;
            draft.assets.thumbnail = image || draft.assets.thumbnail;
            draft.info.description = description || draft.info.description;
        });

        setBookmark(data);
    }, [setBookmark, tab?.title, tab?.url]);

    const setLocalView = useCallback((description?: string, image?: string) => {
        const data = produce(makeBookmark(), (draft) => {
            draft.meta.url = tab?.url || draft.meta.url;
            draft.info.name = tab?.title || draft.info.name;
            draft.assets.thumbnail = image || draft.assets.thumbnail;
            draft.info.description = description || draft.info.description;
        });

        setBookmark(data);
    }, [setBookmark, tab?.title, tab?.url]);

    const updateView = useCallback((v: "local" | "api") => {
        setView(v);
        const image = v === "local" ? localData?.image : apiData?.image;
        const description = v === "local" ? localData?.description : apiData?.description;

        v === "local"
            ? setLocalView(description, image)
            : setAPIView(description, image);
    }, [apiData?.description, apiData?.image, localData?.description, localData?.image, setAPIView, setLocalView]);

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
            setLocalData(data);
        }
    }, [setLocalView]);

    const fetchFromAPI = useCallback(async (url: string) => {
        try {
            const resp = await sendToBackground<ParseMessageRequest, ParseMessageResponse>({
                name: "parse",
                body: { url }
            });

            if (resp.data) {
                setAPIData(resp.data);
            }
        } catch (error) {
            console.error("Error extracting HTML: ", error);
            toast.error("Error extracting HTML");
        }
    }, []);

    const checkExists = useCallback(async (url: string) => {
        return await sendToBackground<ExistsMessageRequest, ExistsMessageResponse>({
            name: "exists",
            body: { url }
        });
    }, []);

    useEffect(() => {
        if (!tab || !tab?.url || autoSave) return;
        const fetchCurrentTab = async () => {
            const data = await checkExists(tab.url);
            if (!data.exists) {
                await Promise.all([
                    fetchFromLocal(tab),
                    fetchFromAPI(tab.url),
                ]).finally(() => setLoading(false));
                return;
            }

            setBookmark(data.bookmark);
            setExists(true);
            setLoading(false);
        };

        fetchCurrentTab();
    }, [autoSave, checkExists, fetchFromAPI, fetchFromLocal, setBookmark, tab]);

    return {
        view,
        exists,
        coverType,
        updateView,
        loading: loading || !tab,
        updateCoverType: setCoverType,
    }
}
