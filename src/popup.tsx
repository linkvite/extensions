
import React, { useEffect, useState } from "react";
import { useViewBookmark } from "~hooks";
import { Spinner } from "~components/spinner";
import { PageProvider } from "~components/wrapper";
import { BookmarkView } from "~components/bookmark";
import {
    AutoSaveContainer,
    PopupContainer,
    PopupLoadingContainer
} from "~styles";
import { getCurrentTab } from "~utils";
import type { browser } from "~browser";
import { useSelector } from "@legendapp/state/react";
import { BookmarkViewControls } from "~components/controls";
import { settingStore } from "~stores";
import { AppText } from "~components/text";
import { useAutoSave } from "~hooks/useAutoSave";

function IndexPopup() {
    const [tab, setTab] = useState<browser.Tabs.Tab | null>(null);
    const { message } = useAutoSave({ tab });
    const { autoSave } = useSelector(settingStore);

    useEffect(() => {
        async function init() {
            setTab(await getCurrentTab());
        }

        init();
    }, []);

    const {
        bookmark,
        exists,
        loading,
        view,
        defaultImage,
        updateView,
        setBookmark,
    } = useViewBookmark({ tab, isPopup: true });

    return (
        <PopupContainer $autoSave={autoSave}>
            <PageProvider>
                {autoSave ? (
                    <AutoSaveContainer>
                        <AppText>{message}</AppText>
                    </AutoSaveContainer>
                ) : loading ? (
                    <PopupLoadingContainer>
                        <Spinner />
                    </PopupLoadingContainer>
                ) : (
                    <React.Fragment>
                        <BookmarkView
                            tabId={tab?.id}
                            exists={exists}
                            bookmark={bookmark}
                            setBookmark={setBookmark}
                            defaultImage={defaultImage}
                        />

                        {exists ? null : (
                            <BookmarkViewControls
                                view={view}
                                updateView={updateView}
                            />
                        )}
                    </React.Fragment>
                )}
            </PageProvider>
        </PopupContainer>
    )
}

// eslint-disable-next-line import/no-unused-modules
export default IndexPopup
