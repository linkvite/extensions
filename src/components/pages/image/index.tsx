import { produce } from "immer";
import { closeTab } from "~router";
import toast from "react-hot-toast";
import { makeBookmark } from "~utils";
import type { Bookmark } from "@linkvite/js";
import type { FileBookmarkProps } from "~api";
import { BookmarkView } from "~components/bookmark";
import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useMemo, useState } from "react";
import type {
	CreateFileMessageRequest,
	CreateFileMessageResponse,
} from "~background/messages/file";
import { useSelector } from "@legendapp/state/react";
import { settingStore } from "~stores";

export function NewImagePage({ params }: { params: URL }) {
	const { autoClose } = useSelector(settingStore);
	const url = decodeURIComponent(params.searchParams.get("url") || "");
	const tabId = decodeURIComponent(params.searchParams.get("tabId") || "");

	const _bookmark = useMemo(() => {
		return produce(makeBookmark(), (draft) => {
			draft.thumbnail = url;
			draft.title = `Image ${new Date().toLocaleString()}`;
		});
	}, [url]);

	const [bookmark, setBookmark] = useState(_bookmark);
	const updateBookmark = useCallback((data: Bookmark) => {
		setBookmark(() => data);
	}, []);

	const onCreate = useCallback(async () => {
		const data: FileBookmarkProps = {
			url,
			tags: bookmark.tags,
			title: bookmark.title,
			starred: bookmark.starred,
			description: bookmark.description,
			collection: bookmark.collection_id,
		};

		const resp = await sendToBackground<
			CreateFileMessageRequest,
			CreateFileMessageResponse
		>({
			name: "file",
			body: { data },
		});

		if ("error" in resp) {
			toast.error(resp.error);
			return;
		}

		toast.success(resp.message);

		if (autoClose) {
			closeTab();
		}
	}, [
		autoClose,
		bookmark.collection_id,
		bookmark.description,
		bookmark.title,
		bookmark.starred,
		bookmark.tags,
		url,
	]);

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
	);
}
