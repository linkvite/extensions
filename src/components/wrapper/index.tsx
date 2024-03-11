import "./styles.css";
import { useTheme } from "~hooks";
import { AuthProvider } from "./auth";
import isPropValid from '@emotion/is-prop-valid';
import { LogoAndTitle } from "~components/linkvite";
import { persistStateObservers } from '~utils/storage';
import { MountedComponent, RootComponent } from "./styles";
import { ThemeProvider, StyleSheetManager } from "styled-components";
import {
    ObservablePersistLocalStorage
} from "@legendapp/state/persist-plugins/local-storage";
import type { StyledTarget } from "styled-components/dist/types";

persistStateObservers({
    pluginLocal: ObservablePersistLocalStorage
});

type RootProps = {
    $isAuth?: boolean;
    children: React.ReactNode;
}

export function RootProvider({ children, $isAuth = false }: RootProps) {
    const { theme } = useTheme();

    function shouldForwardProp(propName: string, target: StyledTarget<"web">) {
        return typeof target === "string" ? isPropValid(propName) : true;
    }

    return (
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <ThemeProvider theme={theme}>
                <RootComponent>
                    <MountedComponent
                        $isAuth={$isAuth}
                    >
                        {children}
                    </MountedComponent>
                </RootComponent>
            </ThemeProvider>
        </StyleSheetManager>
    )
}

export function PageProvider({ children, noClose }: { children: React.ReactNode, noClose?: boolean }) {
    return (
        <RootProvider>
            <AuthProvider>
                <LogoAndTitle noClose={noClose} />
                {children}
            </AuthProvider>
        </RootProvider>
    )
}
