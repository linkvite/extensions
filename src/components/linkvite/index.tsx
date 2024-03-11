import React from "react";
import { closeWindow } from "~router";
import { useAuth } from "~components/wrapper/auth";
import {
    Favicon,
    LinkviteLogo,
    HeaderButton,
    HeaderCloseButton
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
    const { logout } = useAuth();
    const body = (
        <div>
            <HeaderButton onClick={logout}>Logout</HeaderButton>
            {noClose
                ? null
                : <HeaderCloseButton onClick={closeWindow}>Close</HeaderCloseButton>
            }
        </div>
    )
    return (
        <Logo body={body} />
    )
}
