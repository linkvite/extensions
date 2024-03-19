import React, { useMemo } from "react";
import { closeTab, route } from "~router";
import { APP_DOMAIN, FAVICON_URL } from "~utils";
import {
    Favicon,
    LinkviteLogo,
    HeaderButton,
    HeaderButtons,
} from "./styles";

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
    const inOptions = useMemo(() => {
        return location?.href?.endsWith("tabs/index.html?type=options");
    }, []);

    function onSettings() {
        route("tabs/index.html?type=options");
        closeTab();
    }

    const body = (
        <HeaderButtons>
            {inOptions ? null
                : <HeaderButton onClick={onSettings}>
                    Options
                </HeaderButton>
            }

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
