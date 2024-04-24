import { produce } from "immer";
import { browser } from "~browser";
import { sendToBackground } from "@plasmohq/messaging";
import { parseHTML, type ParsedHTML } from "~utils/parser";
import type { Bookmark, ParsedLinkData } from "@linkvite/js";
import React, { useCallback, useEffect, useState } from "react";
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

type ViewProps = {
    title?: string;
    image?: string;
    description?: string;
} | null;

type Props = {
    tab: browser.Tabs.Tab;
    setBookmark: React.Dispatch<React.SetStateAction<Bookmark>>;
}

export function useViewBookmark({ tab, setBookmark }: Props) {
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"local" | "api">("local");

    const { autoSave } = useSelector(settingStore);
    const [apiData, setAPIData] = useState<ParsedLinkData | null>(null);
    const [localData, setLocalData] = useState<ParsedHTML | null>(null);
    const [coverType, setCoverType] = useState<"default" | "custom">("default");

    const setAPIView = useCallback(({ title, image, description }: ViewProps) => {
        setBookmark((prev) => {
            return produce(prev, (draft) => {
                draft.info.name = title || draft.info.name;
                draft.meta.url = tab?.url || draft.meta.url;
                draft.assets.thumbnail = image || draft.assets.thumbnail;
                draft.info.description = description || draft.info.description;
            });
        });
    }, [setBookmark, tab?.url]);

    const setLocalView = useCallback(({ title, image, description }: ViewProps) => {
        setBookmark((prev) => {
            return produce(prev, (draft) => {
                draft.info.name = title || draft.info.name;
                draft.meta.url = tab?.url || draft.meta.url;
                draft.assets.thumbnail = image || draft.assets.thumbnail;
                draft.info.description = description || draft.info.description;
            });
        });
    }, [setBookmark, tab?.url]);

    const updateView = useCallback((v: "local" | "api") => {
        setView(v);
        const title = v === "local" ? tab?.title : apiData?.title;
        const image = v === "local" ? localData?.image : apiData?.image;
        const description = v === "local" ? localData?.description : apiData?.description;

        v === "local"
            ? setLocalView({ title, image, description })
            : setAPIView({ title, image, description });
    }, [apiData?.description, apiData?.image, apiData?.title, localData?.description, localData?.image, setAPIView, setLocalView, tab?.title]);

    const fetchFromLocal = useCallback(async (tab: browser.Tabs.Tab) => {
        const resp = await sendToBackground<ParseHTMLMessageRequest, ParseHTMLMessageResponse>({
            name: "html",
            body: { id: tab.id }
        });

        if ('error' in resp) {
            setLocalView(null);
            toast.error(resp.error);
            return;
        }

        if (resp && resp.data.length > 0) {
            const data = await parseHTML(resp.data[0].result, tab.windowId);
            setLocalView({
                title: tab.title,
                image: data.image,
                description: data.description
            });
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
        if (!tab || !tab?.url || autoSave) {
            setLoading(false);
            return;
        }

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
        loading,
        coverType,
        updateView,
        updateCoverType: setCoverType,
    }
}
