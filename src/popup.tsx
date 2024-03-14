import React, { useState } from "react";
import { useViewBookmark } from "~hooks";
import { Spinner } from "~components/spinner";
import { PageProvider } from "~components/wrapper";
import { BookmarkView } from "~components/bookmark";
import {
    PopupContainer,
    PopupLoadingContainer
} from "~styles";
import { getCurrentTab } from "~utils";
import type { browser } from "~browser";
import { useEffectOnce } from "@legendapp/state/react";
import { BookmarkViewControls } from "~components/controls";

function IndexPopup() {
    const [tab, setTab] = useState<browser.Tabs.Tab | null>(null);
    useEffectOnce(() => {
        (async () => {
            setTab(await getCurrentTab());
        })();
    });

    const {
        bookmark,
        exists,
        loading,
        view,
        defaultImage,
        updateView,
        setBookmark,
    } = useViewBookmark({ tab });

    return (
        <PopupContainer>
            <PageProvider noClose>
                {loading ? (
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
