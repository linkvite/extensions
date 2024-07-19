import styled, { createGlobalStyle } from "styled-components";
import type { ITheme } from "~utils/styles";

export const GlobalStyle = createGlobalStyle<{ bg: string }>`
    html, body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background-color: ${(p) => p.bg};
    }
`;

export const RootComponent = styled.div<{ theme: ITheme }>`
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
    color: ${(p) => p.theme.text};
    background-color: ${(p) => p.theme.background};
`;

export const MountedComponent = styled.div<{ theme: ITheme; $isAuth: boolean }>`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    justify-content: center;
    padding: ${(p) => (p.$isAuth ? "0" : ".75rem")};
    background-color: ${({ theme }) => theme.background};
`;
