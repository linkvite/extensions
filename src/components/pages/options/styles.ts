import { rgba } from "polished";
import styled from "styled-components";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const OptionsContainer = styled.div<{ theme: ITheme }>`
    display: flex;
    flex-direction: column;
    background-color: ${p => p.theme.background_sub};
    width: 100%;
    height: 100%;
    max-width: 300px;
    padding: 15px;
    border-radius: 8px;
`;

export const Label = styled.label<{ theme: ITheme }>`
    font-size: ${Fonts.xxs};
    color: ${p => p.theme.text_sub};
    width: fit-content;
`;

export const ThemeSelect = styled.select<{ theme: ITheme }>`
    width: 100%;
    padding: 10px 5px;
    border-radius: 8px;
    font-size: ${Fonts.xxs};
    color: ${p => p.theme.text};
    margin-bottom: 20px;
    margin-top: 10px;
    outline: none;
    background-color: ${p => p.theme.trans_bg};
    border: 1px solid ${p => rgba(p.theme.text, 0.2)};
    transition: all 0.3s ease-in-out;

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
    max-width: 300px;
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
    margin-top: 20px;
    border-radius: 8px;
    color: ${Colors.light};
    font-size: ${Fonts.xxs};
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
