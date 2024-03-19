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
import { useSelector } from "@legendapp/state/react";
import { settingStore } from "~stores";
import type { CreateBookmarkProps } from "~api";
import type {
    CreateMessageRequest,
    CreateMessageResponse
} from "~background/messages/create";
import { closeTab } from "~router";

type Props = {
    tab: browser.Tabs.Tab;
    isPopup?: boolean;
}

export function useViewBookmark({ tab, isPopup = false }: Props) {
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"local" | "api">("local");

    const { autoSave, autoClose } = useSelector(settingStore);
    const [bookmark, setBookmark] = useState<Bookmark>(null);
    const [apiData, setAPIData] = useState<ParsedLinkData | null>(null);
    const [localData, setLocalData] = useState<ParsedHTML | null>(null);
    const [coverType, setCoverType] = useState<"default" | "custom">("default");

    const updateBookmark = useCallback((data: Bookmark) => {
        setBookmark(() => data);
    }, []);

    const createBookmark = useCallback(async () => {
        const data: CreateBookmarkProps = {
            coverType,
            tags: bookmark.tags,
            url: bookmark.meta.url,
            title: bookmark.info.name,
            starred: bookmark.isLiked,
            favicon: bookmark.assets.icon,
            cover: bookmark.assets.thumbnail,
            collection: bookmark.info.collection,
            description: bookmark.info.description,
        }

        const resp = await sendToBackground<CreateMessageRequest, CreateMessageResponse>({
            name: "create",
            body: { data }
        });

        if ('error' in resp) {
            toast.error(resp.error);
            return;
        }

        toast.success(resp.message);

        if (autoClose) {
            closeTab();
        }
    }, [bookmark, coverType, autoClose]);

    const setAPIView = useCallback((description?: string, image?: string) => {
        const data = produce(makeBookmark(), (draft) => {
            draft.meta.url = tab?.url || draft.meta.url;
            draft.info.name = tab?.title || draft.info.name;
            draft.assets.thumbnail = image || draft.assets.thumbnail;
            draft.info.description = description || draft.info.description;
        });

        setBookmark(() => data);
    }, [tab?.title, tab?.url]);

    const setLocalView = useCallback((description?: string, image?: string) => {
        const data = produce(makeBookmark(), (draft) => {
            draft.meta.url = tab?.url || draft.meta.url;
            draft.info.name = tab?.title || draft.info.name;
            draft.assets.thumbnail = image || draft.assets.thumbnail;
            draft.info.description = description || draft.info.description;
        });

        setBookmark(() => data);
    }, [tab?.title, tab?.url]);

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

            setBookmark(data.bookmark);
            setExists(true);
            setLoading(false);
        };

        fetchCurrentTab();
    }, [autoSave, checkExists, fetchFromAPI, fetchFromLocal, isPopup, tab]);

    return {
        view,
        exists,
        bookmark,
        updateView,
        updateBookmark,
        createBookmark,
        loading: loading || !tab,
        updateCoverType: setCoverType,
    }
}