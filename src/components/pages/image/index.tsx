import { produce } from "immer";
import { closeTab } from "~router";
import toast from "react-hot-toast";
import { makeBookmark } from "~utils";
import type { Bookmark } from "@linkvite/js";
import { type FileBookmarkProps } from "~api";
import { BookmarkView } from "~components/bookmark";
import { sendToBackground } from "@plasmohq/messaging";
import React, { useCallback, useMemo, useState } from "react";
import type {
    CreateFileMessageRequest,
    CreateFileMessageResponse
} from "~background/messages/file";
import { useSelector } from "@legendapp/state/react";
import { settingStore } from "~stores";

export function NewImagePage({ params }: { params: URL }) {
    const { autoClose } = useSelector(settingStore);
    const url = decodeURIComponent(params.searchParams.get('url') || '');
    const tabId = decodeURIComponent(params.searchParams.get('tabId') || '');

    const _bookmark = useMemo(() => {
        return produce(makeBookmark(), (draft) => {
            draft.assets.thumbnail = url;
            draft.info.name = `Image ${new Date().toLocaleString()}`;
        })
    }, [url]);

    const [bookmark, setBookmark] = useState(_bookmark);
    const updateBookmark = useCallback((data: Bookmark) => {
        setBookmark(() => data);
    }, []);

    const onCreate = useCallback(async () => {
        const data: FileBookmarkProps = {
            url,
            tags: bookmark.tags,
            title: bookmark.info.name,
            starred: bookmark.isLiked,
            collection: bookmark.info.collection,
            description: bookmark.info.description,
        }

        const resp = await sendToBackground<CreateFileMessageRequest, CreateFileMessageResponse>({
            name: "file",
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
    }, [autoClose, bookmark.info.collection, bookmark.info.description, bookmark.info.name, bookmark.isLiked, bookmark.tags, url]);

    return (
        <BookmarkView
            hideURL
            disabledImage
            exists={false}
            onCreate={onCreate}
            bookmark={bookmark}
            tabId={Number(tabId)}
            updateBookmark={updateBookmark}
        />
    )
}
