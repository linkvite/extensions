import styled from "styled-components";
import { Colors, type ITheme } from "~utils/styles";

export const LinkviteLogo = styled.div<{ theme: ITheme; $hasButtons?: boolean }>`
    width: 100%;
    display: flex;
    z-index: 5;
    margin: 0;
    align-items: center;
    align-self: flex-start;
    justify-content: space-between;

    a {
        font-weight: bold;
        text-decoration: none;
        color: ${p => p.theme.text};
        font-size: 1.15rem;
        display: flex;
        align-items: center;
    }

    a:hover {
        cursor: pointer;
    }
`;

export const HeaderButtons = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const HeaderButton = styled.button<{ theme: ITheme }>`
    border: none;
    padding: 5px 10px;
    margin-left: 5px;
    border-radius: .25rem;
    color: ${p => p.theme.text};
    transition: all .3s ease-in-out;
    background-color: transparent;
    background-color: ${p => p.theme.trans_bg};

    &:hover {
        cursor: pointer;
        color: ${Colors.light};
        background-color: ${Colors.primary};
    }
`;

export const Favicon = styled.img`
    width: 30px;
    height: 30px;
    object-fit: cover;
    margin-right: 10px;
`;
