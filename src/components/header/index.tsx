import React from "react";
import { closeTab, route } from "~router";
import {
    Favicon,
    LinkviteLogo,
    HeaderButton,
    HeaderButtons,
} from "./styles";
import { APP_DOMAIN, FAVICON_URL } from "~utils";

export function Logo({ body }: { body?: React.ReactNode }) {
    return (
        <LinkviteLogo
            $hasButtons={!!body}
        >
            <a href={APP_DOMAIN}>
                <Favicon
                    alt="paws"
                    src={FAVICON_URL}
                />

                Linkvite
            </a>

            {body}
        </LinkviteLogo>
    )
}

export function LogoAndTitle({ noClose }: { noClose?: boolean }) {
    function onSettings() {
        route("tabs/index.html?type=options");
        // closeTab();
    }
    const body = (
        <HeaderButtons>
            <HeaderButton onClick={onSettings}>
                Account
            </HeaderButton>

            {noClose ? null
                : <HeaderButton
                    onClick={() => closeTab(true)}
                >
                    Close
                </HeaderButton>
            }
        </HeaderButtons>
    )
    return (
        <Logo body={body} />
    )
}
