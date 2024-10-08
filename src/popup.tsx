import { useSelector } from "@legendapp/state/react";
import { sendToBackground } from "@plasmohq/messaging";
import {
	Fragment,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import toast from "react-hot-toast";
import type { CreateBookmarkProps } from "~api";
import type {
	CreateMessageRequest,
	CreateMessageResponse,
} from "~background/messages/create";
import { browser } from "~browser";
import { BookmarkView } from "~components/bookmark";
import { NewImagePage } from "~components/pages/image";
import { NewLinkPage } from "~components/pages/link";
import { OptionsPage } from "~components/pages/options";
import { NewTabsPage } from "~components/pages/tabs";
import { Spinner } from "~components/spinner";
import { AppText } from "~components/text";
import { PageProvider } from "~components/wrapper";
import { useViewBookmark } from "~hooks";
import { useAutoSave } from "~hooks/useAutoSave";
import { closeTab } from "~router";
import { settingStore, userStore } from "~stores";
import {
	AutoSaveContainer,
	PopupAction,
	PopupActions,
	PopupContainer,
	PopupLoadingContainer,
} from "~styles";
import { getCurrentTab, makeBookmark } from "~utils";

function IndexPopup() {
	const { autoSave, autoClose, currentPage } = useSelector(settingStore);
	const { id, name, username } = useSelector(userStore);
	const [showBookmark, setShowBookmark] = useState(false);
	const [bookmark, setBookmark] = useState(makeBookmark());
	const [tab, setTab] = useState<browser.Tabs.Tab | null>(null);

	const params = useMemo(() => new URL(window.location.href), []);
	const { message, exists: autoSaveExists } = useAutoSave({ tab, setBookmark });

	const { view, exists, loading, updateView } = useViewBookmark({
		tab,
		setBookmark,
	});

	const bookmarkExists = useMemo(
		() => exists || autoSaveExists,
		[exists, autoSaveExists],
	);

	const onCreate = useCallback(async () => {
		const data: CreateBookmarkProps = {
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
	}, [bookmark, autoClose]);

	useLayoutEffect(() => {
		const page = decodeURIComponent(
			params.searchParams.get("page") || "popup",
		) as "popup" | "options";
		settingStore.currentPage.set(page);
	}, [params]);

	useEffect(() => {
		async function init() {
			try {
				const tabId = params.searchParams.get("tabId");
				if (tabId) {
					const tab = await browser.tabs.get(parseInt(tabId));
					setTab(tab);
				} else {
					setTab(await getCurrentTab());
				}
			} catch (error) {
				console.error(error);
				toast.error("Could not get the current page");
			}
		}

		init();
	}, [params]);

	return (
		<PopupContainer
			$autoSave={
				autoSave && id !== "" && currentPage === "popup" && !showBookmark
			}
		>
			<PageProvider>
				{currentPage === "popup" ? (
					autoSave && !showBookmark ? (
						<AutoSaveContainer>
							<AppText>{message}</AppText>

							{autoSaveExists ? (
								<PopupAction
									$active
									style={{ marginTop: 10 }}
									onClick={() => setShowBookmark(true)}
								>
									View
								</PopupAction>
							) : null}
						</AutoSaveContainer>
					) : loading ? (
						<PopupLoadingContainer>
							<Spinner />
						</PopupLoadingContainer>
					) : (
						<Fragment>
							<BookmarkView
								tabId={tab?.id}
								bookmark={bookmark}
								exists={bookmarkExists}
								onCreate={onCreate}
								updateBookmark={setBookmark}
							/>

							{bookmarkExists ? null : (
								<>
									<PopupActions>
										<PopupAction
											onClick={() => updateView("local")}
											$active={view === "local"}
										>
											Local
										</PopupAction>
										<PopupAction
											onClick={() => updateView("api")}
											$active={view === "api"}
										>
											Server
										</PopupAction>
									</PopupActions>
									<AppText
										isSubText
										fontSize="xxs"
										textAlign="center"
										topSpacing="sm"
									>
										Logged in as {name || `@${username}`}
									</AppText>
								</>
							)}
						</Fragment>
					)
				) : currentPage === "options" ? (
					<OptionsPage />
				) : currentPage === "tabs" ? (
					<NewTabsPage />
				) : currentPage === "image" ? (
					<NewImagePage params={params} />
				) : currentPage === "link" ? (
					<NewLinkPage params={params} />
				) : null}
			</PageProvider>
		</PopupContainer>
	);
}

export default IndexPopup;
