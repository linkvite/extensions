import { rgba } from "polished";
import styled from "styled-components";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const OptionsContainer = styled.div<{ theme: ITheme }>`
    display: flex;
    flex-direction: column;
    background-color: ${p => p.theme.background_sub};
    width: 100%;
    height: 100%;
    max-width: 576px;
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
`;

export const Label = styled.label<{ theme: ITheme }>`
    font-size: ${Fonts.xxs};
    color: ${p => p.theme.text_sub};
    width: fit-content;
`;

export const ThemeSelect = styled.select<{ theme: ITheme }>`
    width: 100%;
    padding: 10px 10px;
    border-radius: 8px;
    font-size: ${Fonts.xxs};
    color: ${p => p.theme.text};
    margin-bottom: 20px;
    margin-top: 10px;
    outline: none;
    border: 1px solid ${p => rgba(p.theme.text, 0.2)};
    transition: all 0.3s ease-in-out;
    
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23${p => p.theme.text_sub.replace("#", "")}'><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
    background-size: 10px;
    background-color: ${p => p.theme.trans_bg};
    background-position: calc(100% - 10px) 60%;

    &:hover {
        cursor: pointer;
        border-color: ${p => rgba(p.theme.text, 0.5)};
    }

    &:focus {
        border-color: ${p => rgba(p.theme.text, 0.5)};
    }
`;

export const CollectionContainer = styled.button<{ theme: ITheme }>`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border-radius: 8px;
    font-size: ${Fonts.xxs};
    color: ${p => p.theme.text};
    outline: none;
    background-color: ${p => p.theme.trans_bg};
    border: 1px solid ${p => rgba(p.theme.text, 0.2)};
    transition: all 0.3s ease-in-out;

    &:hover {
        border-color: ${p => rgba(p.theme.text, 0.5)};
    }

    &:focus {
        border-color: ${p => rgba(p.theme.text, 0.5)};
    }
`;

export const AutoContainers = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 20px;

    label {
        &:hover {
            cursor: pointer;
        }
    }
`;

export const AutoCheckInput = styled.input<{ theme: ITheme }>`
    width: 15px;
    height: 15px;
    outline: none;
    border-radius: 3px;
    margin-right: 10px;
    border: 1px solid ${p => p.theme.text_sub};
    background-color: transparent;
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        border: 1px solid ${Colors.primary};
    }

    &:focus {
        border: 1px solid ${p => p.theme.text_sub};
    }

    &:checked {
        border: 1px solid ${Colors.primary};
    }
`;

export const LogoutButton = styled.button<{ theme: ITheme }>`
    width: 100%;
    padding: 10px;
    outline: none;
    margin-top: 10px;
    border-radius: 8px;
    color: ${Colors.light};
    font-weight: bold;
    font-size: ${Fonts.xs};
    background-color: ${Colors.error};
    border: 1px solid transparent;
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        background-color: ${rgba(Colors.error, 0.8)};
    }

    &:focus {
        border: 1px solid ${p => rgba(p.theme.text, 0.5)};
    }
`;
