import { rgba } from "polished";
import styled from "styled-components";
import { BookmarkStarIcon } from "~components/bookmark/styles";
import { AppText } from "~components/text";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const TabContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
    width: 100%;
    position: relative;
`;

export const TabPermissionHeader = styled(AppText)`
    font-weight: bold;
    text-align: center;
    font-size: ${Fonts.sm};
`;

export const TabPermissionText = styled(AppText)`
    margin-top: .5rem;
    text-align: center;
`;

export const TabPermissionButton = styled.button`
    background-color: ${Colors.primary};
    color: ${Colors.light};
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    margin-top: 1rem;
    border: none;
    outline: none;
    font-size: 1rem;
    font-weight: 500;
`;

export const TabList = styled.ol`
    margin: 0;
    padding: 0;
    list-style: none;
    width: 100%;
    margin-bottom: 5rem;
`;

export const TabListItem = styled.li<{ theme: ITheme }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: .5rem;
    border-bottom: .5px solid ${p => p.theme.background_sub};
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    border-radius: 0.5rem;
    position: relative;

    &:hover {
        background-color: ${p => p.theme.trans_bg};
    }
`;

export const TabListItemCheck = styled.button`
    padding: 0;
    height: 15px;
    width: 15px;
    border: none;
    margin-right: 1rem;
    background-color: transparent;
`;

export const TabListItemInfo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: calc(100% - 16px);
`;


export const TabListItemInfoBottom = styled.div`
    display: flex;
    align-items: center;
`;

export const TabListItemTitle = styled(AppText)`
    width: 100%;
    max-width: 100%;
    font-weight: 500;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

export const TabListItemDescription = styled(AppText)`
    width: 100%;
    max-width: 100%;
    font-size: ${Fonts.xxs};
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    margin-top: 0.25rem;
`;

export const TabListItemUrl = styled(AppText)`
    max-width: 100%;
    font-size: ${Fonts.xxs};
    margin-top: 0.25rem;
    margin-left: 0.25rem;
`;

export const TabAddButtonContainer = styled.div<{ $active: boolean; theme: ITheme }>`
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    padding: 0;
    height: 35px;
    position: fixed;
    bottom: 2%;
    right: 3%;
    display: flex;
    background-color: ${p => p.theme.background_sub};
    transform: translateX(${p => p.$active ? 0 : 200}%);
`;

export const TabAddButton = styled.button<{ $active: boolean }>`
    background-color: ${Colors.primary};
    color: ${Colors.light};
    border: none;
    padding: .55rem .75rem;
    border-radius: 0.5rem;
    border: none;
    outline: none;
    display: flex;
    flex-direction: row;
    transition: all 0.3s ease-in-out;
    transform: translateX(${p => p.$active ? 0 : 200}%);
    font-weight: 500;
    font-size: ${Fonts.xs};

    &:hover {
        cursor: pointer;
        background-color: ${rgba(Colors.primary, 0.9)};
    }
`;

export const TabSelectCollectionButton = styled.button<{ $hide: boolean, }>`
    padding: 0;
    margin: 0;
    background-color: transparent;
    color: ${Colors.light};
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    border: none;
    outline: none;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-in-out;
    width: ${p => p.$hide ? "0" : "40px"};
    opacity: ${p => p.$hide ? 0 : 1};
    visibility: ${p => p.$hide ? "hidden" : "visible"};

    &:hover {
        cursor: pointer;
        scale: 1.1;
    }
`;

export const TabEditButton = styled.button<{ $hide: boolean }>`
    padding: 0;
    margin: 0;
    background-color: transparent;
    color: ${Colors.light};
    border: none;
    border-radius: 0.25rem;
    border: none;
    outline: none;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-in-out;
    opacity: ${p => p.$hide ? 0 : 1};
    position: absolute;
    right: 10px;

    &:hover {
        cursor: pointer;
        scale: 1.1;
    }
`;

export const TabStarIcon = styled(BookmarkStarIcon) <{ theme: ITheme; $active: boolean }>`
    height: 20px;
    width: 20px;
    border: none;
    margin-top: 0.25rem;
    background-color: transparent;
    transition: all 0.3s ease-in-out;
    color: ${p => p.$active ? Colors.warning : p.theme.text_sub};

    &:hover {
        border: none;
        cursor: pointer;
        color: ${Colors.warning};
        background-color: transparent;
    }
`;

export const TabDescriptionInput = styled.textarea<{ theme: ITheme }>`
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    min-height: 100px;
    border-radius: 0.25rem;
    padding: 10px;
    margin-right: 10px;
    max-height: 300px;
    outline: none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    color: ${p => p.theme.text};
    font-size: 14px;
    line-height: 1.5;

    &::placeholder {
        color: ${p => p.theme.text_sub};
    }

    &:focus {
        outline: none;
    }
`;