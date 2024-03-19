import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { browser } from "~browser";
import { BookmarkView } from "~components/bookmark";
import { BookmarkViewControls } from "~components/controls";
import { Spinner } from "~components/spinner";
import { AppText } from "~components/text";
import { useViewBookmark } from "~hooks";
import { AutoSaveContainer, PopupLoadingContainer } from "~styles";

export function BookmarkPage({ params }: { params: URL }) {
    const [tab, setTab] = useState<browser.Tabs.Tab | null>(null);
    const tabId = decodeURIComponent(params.searchParams.get('tabId') || '');
    useEffect(() => {
        async function init() {
            try {
                setTab(await browser.tabs.get(parseInt(tabId)));
            } catch (error) {
                toast.error('Could not get the current page');
                console.error(error);
            }
        }

        init();
    }, [tabId]);

    const {
        bookmark,
        exists,
        loading,
        view,
        updateView,
        updateBookmark,
        createBookmark,
        updateCoverType,
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
        </React.Fragment>
    )
}