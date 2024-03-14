import styled from "styled-components";
import { Colors, Fonts, type ITheme } from "~utils/styles";

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
        font-size: ${Fonts.sm};
        display: flex;
        align-items: center;
    }

    a:hover {
        cursor: pointer;
    }
`;

export const HeaderButton = styled.button<{ theme: ITheme }>`
    border: none;
    margin-left: 5px;
    padding: .5rem 1rem;
    border-radius: .5rem;
    color: ${p => p.theme.text};
    transition: all .3s ease-in-out;
    background-color: transparent;

    &:hover {
        cursor: pointer;
        opacity: .8;
    }
`;

export const HeaderCloseButton = styled(HeaderButton)`
    padding: .4rem 1rem;
    color: ${Colors.light};
    background-color: ${Colors.primary};
`;

export const Favicon = styled.img`
    width: 35px;
    height: 35px;
    object-fit: cover;
    margin-right: 10px;
`;
