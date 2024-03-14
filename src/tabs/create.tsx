import { browser } from "~browser";
import { PageContainer } from "./styles";
import { useViewBookmark } from "~hooks";
import { Spinner } from "~components/spinner";
import { BookmarkViewControls } from "~popup";
import { PopupLoadingContainer } from "~styles";
import { PageProvider } from "~components/wrapper";
import { BookmarkView } from "~components/bookmark";
import React, { useEffect, useMemo, useState } from "react";

function CreateBookmarkPage() {
    const [tab, setTab] = useState<browser.Tabs.Tab | null>(null);
    const params = useMemo(() => new URL(window.location.href), []);
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
        <PageContainer>
            <PageProvider>
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
            </PageProvider>
        </PageContainer>
    )
}

export default CreateBookmarkPage
