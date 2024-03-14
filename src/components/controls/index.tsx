import React from "react";
import {
    PopupAction,
    PopupActions,
    PopupActionDescription,
    PopupActionText
} from "~styles";
import { AppPopover } from "~components/primitives/popover";

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