import React, { useState } from "react";
import { useViewBookmark } from "~hooks";
import { Spinner } from "~components/spinner";
import { PageProvider } from "~components/wrapper";
import { BookmarkView } from "~components/bookmark";
import { AppPopover } from "~components/primitives/popover";
import {
    PopupAction,
    PopupActionDescription,
    PopupActionText,
    PopupActions,
    PopupContainer,
    PopupLoadingContainer
} from "~styles";
import { getCurrentTab } from "~utils";
import type { browser } from "~browser";
import { useEffectOnce } from "@legendapp/state/react";

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

type ControlProps = {
    view: "local" | "api";
    updateView: (view: "local" | "api") => void;
}

export function BookmarkViewControls({ view, updateView }: ControlProps) {
    return (
        <React.Fragment>
            <PopupActions>
                <PopupAction onClick={() => updateView("local")} $active={view === "local"}>Local</PopupAction>
                <PopupAction onClick={() => updateView("api")} $active={view === "api"}>API</PopupAction>
            </PopupActions>

            <AppPopover
                trigger={
                    <PopupActionText
                        $isSubText
                    >
                        ^ {" "}
                        <span style={{ textDecorationLine: "underline" }}>
                            what is this?
                        </span>
                        {" "}^
                    </PopupActionText>
                }
            >
                <PopupActionDescription>
                    <b>Local vs API Metadata</b>

                    <br /> <br />
                    The <b>{"Local Metadata"}</b> view extracts data directly from the
                    HTML metadata of the current web page you are visiting,
                    while the <b>{"API Data"}</b> view fetches information from our API.

                    <br /> <br />
                    Local metadata extraction is faster, but it is inconsistent across
                    different websites. For example: you would see the correct
                    title and URL, but the image and/or description might be from
                    the previous page you visited. This is because some websites like
                    <b> Youtube</b> do not update the entire metadata when the URL changes.
                    To get the most accurate data using this view, you would need to manually
                    refresh the page and then click on the extension.

                    <br /> <br />
                    The API view is consistent across all websites,
                    but might not provide all the metadata like the image or description.
                    This is because some websites do not allow us to fetch their metadata using
                    the API. However, the data displayed is always up-to-date and accurate if available.
                </PopupActionDescription>
            </AppPopover>
        </React.Fragment>
    )
}

export default IndexPopup
