import { closeTab } from "~router";
import { settingStore } from "~stores";
import type { browser } from "~browser";
import { storage } from "~utils/storage";
import type { Bookmark, Collection } from "@linkvite/js";
import { useSelector } from "@legendapp/state/react";
import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
	ExistsMessageRequest,
	ExistsMessageResponse,
} from "~background/messages/exists";
import type {
	CreateBookmarkRequest,
	CreateBookmarkResponse,
} from "~background/messages/link";

type Props = {
	tab: browser.Tabs.Tab;
	setBookmark: (bookmark: Bookmark) => void;
};

/**
 * Hook to auto save a bookmark.
 *
 * Used only in popup when user has enabled auto save.
 */
export function useAutoSave({ tab, setBookmark }: Props) {
	const [error, setError] = useState<string | null>(null);
	const { autoSave, autoClose } = useSelector(settingStore);
	const [status, setStatus] = useState<
		"loading" | "success" | "error" | "exists"
	>("loading");

	const message = useMemo(() => {
		return status === "loading"
			? "Saving..."
			: status === "exists"
				? "Bookmark already exists"
				: status === "error"
					? error || "An error occurred"
					: "Saved";
	}, [error, status]);

	const checkExists = useCallback(async (url: string) => {
		return await sendToBackground<ExistsMessageRequest, ExistsMessageResponse>({
			name: "exists",
			body: { url },
		});
	}, []);

	const autoSaveAction = useCallback(
		async (tab: browser.Tabs.Tab) => {
			const exists = await checkExists(tab.url);
			if (exists.exists) {
				setStatus("exists");
				setBookmark(exists.bookmark);
				setError("Bookmark already exists");
				return;
			}

			const collection = await storage.get<Collection | undefined>(
				"collection",
			);
			const resp = await sendToBackground<
				CreateBookmarkRequest,
				CreateBookmarkResponse
			>({
				name: "link",
				body: {
					url: tab.url,
					collection: collection?.id,
				},
			});

			if ("error" in resp) {
				setStatus("error");
				setError(resp.error);
				return;
			}

			setStatus("success");

			if (autoClose) {
				await closeTab();
			}
		},
		[autoClose, checkExists, setBookmark],
	);

	useEffect(() => {
		async function init() {
			if (!autoSave || !tab || !tab?.url) {
				return;
			}
			await autoSaveAction(tab);
		}

		init();
	}, [autoSave, autoSaveAction, tab]);

	return {
		message,
		exists: status === "exists",
	};
}
