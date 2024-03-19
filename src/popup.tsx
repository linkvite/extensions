
import React, { useCallback, useEffect, useState } from "react";
import { useViewBookmark } from "~hooks";
import { Spinner } from "~components/spinner";
import { PageProvider } from "~components/wrapper";
import { BookmarkView } from "~components/bookmark";
import {
    AutoSaveAction,
    AutoSaveContainer,
    PopupContainer,
    PopupLoadingContainer
} from "~styles";
import { getCurrentTab } from "~utils";
import type { browser } from "~browser";
import { useSelector } from "@legendapp/state/react";
import { BookmarkViewControls } from "~components/controls";
import { settingStore, userStore } from "~stores";
import { AppText } from "~components/text";
import { useAutoSave } from "~hooks/useAutoSave";
import toast from "react-hot-toast";
import { closeTab, route } from "~router";

function IndexPopup() {
    const { id } = useSelector(userStore);
    const { autoSave } = useSelector(settingStore);
    const [tab, setTab] = useState<browser.Tabs.Tab | null>(null);
    const { message, exists: autoSaveExists, url } = useAutoSave({ tab });

    useEffect(() => {
        async function init() {
            try {
                setTab(await getCurrentTab());
            } catch (error) {
                console.error(error);
                toast.error("Could not get the current page");
            }
        }

        init();
    }, []);

    const {
        bookmark,
        exists,
        loading,
        view,
        updateView,
        updateBookmark,
        createBookmark,
        updateCoverType,
    } = useViewBookmark({ tab, isPopup: true });

    const onView = useCallback(() => {
        route(`tabs/index.html?type=link&tabId=${tab?.id}&url=${encodeURIComponent(url)}`);
        closeTab();
    }, [tab?.id, url]);

    return (
        <PopupContainer $autoSave={autoSave && id !== ""}>
            <PageProvider>
                {autoSave ? (
                    <AutoSaveContainer>
                        <AppText>{message}</AppText>

                        {autoSaveExists
                            ? <AutoSaveAction
                                onClick={onView}
                            >
                                View
                            </AutoSaveAction>
                            : null
                        }
                    </AutoSaveContainer>
                ) : loading ? (
                    <PopupLoadingContainer>
                        <Spinner />
                    </PopupLoadingContainer>
                ) : bookmark ? (
                    <React.Fragment>
                        <BookmarkView
                            tabId={tab?.id}
                            exists={exists}
                            bookmark={bookmark}
                            onCreate={createBookmark}
                            updateBookmark={updateBookmark}
                            updateCoverType={updateCoverType}
                        />

                        {exists ? null : (
                            <BookmarkViewControls
                                view={view}
                                updateView={updateView}
                            />
                        )}
                    </React.Fragment>
                ) : (
                    <AutoSaveContainer>
                        <AppText>Bookmark not found</AppText>
                    </AutoSaveContainer>
                )}
            </PageProvider>
        </PopupContainer>
    )
}

// eslint-disable-next-line import/no-unused-modules
export default IndexPopup
