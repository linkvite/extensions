import styled from "styled-components";
import { Colors, type ITheme } from "~utils/styles";

export const PopupContainer = styled.div<{ $autoSave?: boolean }>`
    width: 100%;
    height: 100%;
    min-width: 576px;
    position: relative;
    min-height: ${p => p.$autoSave ? 150 : 600}px;
`;

export const PopupLoadingContainer = styled(PopupContainer)`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 500px;
    min-height: 500px;
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

export const AutoSaveContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 576px;
    min-height: calc(150px - 70px);
`;
