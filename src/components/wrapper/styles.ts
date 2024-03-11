import styled from "styled-components";
import type { ITheme } from "~utils/styles";

export const RootComponent = styled.div<{ theme: ITheme }>`
    width: 100dvw;
    height: 100dvh;
    min-height: 400px;
    min-width: 600px;
    color: ${({ theme }) => theme.text};
    background-color: ${({ theme }) => theme.background};
`;

export const MountedComponent = styled.div<{ theme: ITheme; $isAuth: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    justify-content: center;
    padding: .75rem;
    background-color: ${({ theme }) => theme.background};
    width: ${({ $isAuth }) => $isAuth ? "100%" : "auto"};
    height: ${({ $isAuth }) => $isAuth ? "100%" : "auto"};
`;
