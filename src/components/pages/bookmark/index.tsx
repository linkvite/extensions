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
        (async () => {
            const t = await browser.tabs.get(parseInt(tabId));
            setTab(t);
        })();
    }, [tabId]);

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
        <React.Fragment>
            {loading ? (
                <PopupLoadingContainer>
                    <Spinner />
                </PopupLoadingContainer>
            ) : (
                <React.Fragment>
                    <BookmarkView
                        exists={exists}
                        bookmark={bookmark}
                        tabId={Number(tabId)}
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
        </React.Fragment>
    )
}