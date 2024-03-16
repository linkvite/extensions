import React, { useState, useEffect } from "react";
import { browser } from "~browser";
import { BookmarkView } from "~components/bookmark";
import { BookmarkViewControls } from "~components/controls";
import { Spinner } from "~components/spinner";
import { useViewBookmark } from "~hooks";
import { PopupLoadingContainer } from "~styles";

export function BookmarkPage({ params }: { params: URL }) {
    const [tab, setTab] = useState<browser.Tabs.Tab | null>(null);
    const tabId = decodeURIComponent(params.searchParams.get('tabId') || '');
    useEffect(() => {
        async function init() {
            setTab(await browser.tabs.get(parseInt(tabId)));
        }

        init();
    }, [tabId]);

    const {
        bookmark,
        exists,
        loading,
        view,
        defaultImage,
        updateView,
        updateBookmark,
    } = useViewBookmark({ tab });

    return (
        <React.Fragment>
            {loading ? (
                <PopupLoadingContainer>
                    <Spinner />
                </PopupLoadingContainer>
            ) : bookmark ? (
                <React.Fragment>
                    <BookmarkView
                        tabId={tab?.id}
                        exists={exists}
                        bookmark={bookmark}
                        defaultImage={defaultImage}
                        updateBookmark={updateBookmark}
                    />

                    {exists ? null : (
                        <BookmarkViewControls
                            view={view}
                            updateView={updateView}
                        />
                    )}
                </React.Fragment>
            ) : <div>Bookmark not found</div>}
        </React.Fragment>
    )
}