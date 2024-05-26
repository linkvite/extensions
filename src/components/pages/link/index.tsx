import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { useCallback, useEffect } from "react";
import { sendToBackground } from "@plasmohq/messaging";
import type { Bookmark } from "@linkvite/js";
import type {
	ExistsMessageRequest,
	ExistsMessageResponse,
} from "~background/messages/exists";
import type {
	ParseMessageRequest,
	ParseMessageResponse,
} from "~background/messages/parse";
import { BookmarkView } from "~components/bookmark";
import { produce } from "immer";
import { closeTab } from "~router";
import { Spinner } from "~components/spinner";
import type { CreateBookmarkProps } from "~api";
import type {
	CreateMessageRequest,
	CreateMessageResponse,
} from "~background/messages/create";
import { makeBookmark } from "~utils";
import { useSelector } from "@legendapp/state/react";
import { settingStore } from "~stores";

export function NewLinkPage({ params }: { params: URL }) {
	const [exists, setExists] = useState(false);
	const [loading, setLoading] = useState(false);
	const [bookmark, setBookmark] = useState<Bookmark>(makeBookmark());
	const [coverType, setCoverType] = useState<"default" | "custom">("default");

	const { autoClose } = useSelector(settingStore);
	const url = decodeURIComponent(params.searchParams.get("url") || "");
	const tabId = decodeURIComponent(params.searchParams.get("tabId") || "");

	const updateBookmark = useCallback((bookmark: Bookmark) => {
		setBookmark(() => bookmark);
	}, []);

	const createBookmark = useCallback(async () => {
		if (exists) {
			toast.error("Bookmark already exists");
			return;
		}

		const data: CreateBookmarkProps = {
			coverType,
			tags: bookmark.tags,
			url: bookmark.url,
			title: bookmark.title,
			starred: bookmark.starred,
			favicon: bookmark.icon,
			cover: bookmark.thumbnail,
			collection: bookmark.collection_id,
			description: bookmark.description,
		};

		const resp = await sendToBackground<
			CreateMessageRequest,
			CreateMessageResponse
		>({
			name: "create",
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
	}, [autoClose, bookmark, coverType, exists]);

	const checkExists = useCallback(async (url: string) => {
		const resp = await sendToBackground<
			ExistsMessageRequest,
			ExistsMessageResponse
		>({
			name: "exists",
			body: { url },
		});

		if (resp.exists) {
			setExists(true);
			setBookmark(resp.bookmark);
		}

		return resp.exists;
	}, []);

	const fetchFromAPI = useCallback(async (url: string) => {
		try {
			const resp = await sendToBackground<
				ParseMessageRequest,
				ParseMessageResponse
			>({
				name: "parse",
				body: { url },
			});

			if (resp.data) {
				setBookmark((prev) => {
					return produce(prev, (draft) => {
						draft.title = resp.data.title;
						draft.description = resp.data.description;
						draft.url = resp.data.url;
						draft.icon = resp.data.favicon;
						draft.thumbnail = resp.data.image;
					});
				});
			}
		} catch (error) {
			console.error("Error extracting HTML: ", error);
			toast.error("Error extracting HTML");
		}
	}, []);

	useEffect(() => {
		async function init() {
			setLoading(true);
			const exists = await checkExists(url);
			if (exists) {
				setLoading(false);
				return;
			}

			await fetchFromAPI(url);
			setLoading(false);
		}

		init();
	}, [checkExists, fetchFromAPI, url]);

	return (
		<Fragment>
			{loading ? (
				<Spinner />
			) : (
				<BookmarkView
					exists={exists}
					bookmark={bookmark}
					tabId={Number(tabId)}
					onCreate={createBookmark}
					updateCoverType={setCoverType}
					updateBookmark={updateBookmark}
				/>
			)}
		</Fragment>
	);
}
