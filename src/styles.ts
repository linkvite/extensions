import styled from "styled-components";
import { AppText } from "~components/text";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const PopupContainer = styled.div`
    width: 100%;
    height: 100%;
    min-width: 500px;
    min-height: 600px;
    position: relative;
`;

export const PopupLoadingContainer = styled(PopupContainer)`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const PopupActions = styled.div`
    display: flex;
    margin-top: 15px;
    position: sticky;
    bottom: 10px;
    left: 0;
    background-color: ${p => p.theme.background_sub};
    padding: 8px;
    border-radius: .5rem;
    align-items: center;
    justify-content: center;
    align-self: center;
`;

export const PopupAction = styled.button<{ $active: boolean; theme: ITheme }>`
    border: none;
    height: 25px;
    width: 60px;
    padding: 0;
    align-items: center;
    justify-content: center;
    border-radius: .25rem;
    color: ${Colors.light};
    font-weight: 600;
    transition: all 0.2s ease-in-out;
    background-color: ${p => p.$active ? Colors.primary : p.theme.background_sub};

    &:hover {
        cursor: pointer;
        opacity: 0.9;
    }
`;

export const PopupActionText = styled(AppText) <{ theme: ITheme }>`
    font-size: ${Fonts.xxs};
    color: ${p => p.theme.text_sub};
    transition: all 0.3s ease-in-out;
    margin-top: 5px;

    &:hover {
        cursor: pointer;
        color: ${p => p.theme.text};
    }
`;

export const PopupActionDescription = styled(AppText)`
    margin-top: 5px;
    margin-bottom: 10px;
    font-size: ${Fonts.xxs};
    max-height: 200px;
    overflow-y: scroll;
`;

export const PageContainer = styled.div`
    width: 100%;
    height: 100%;
    min-height: 400px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;