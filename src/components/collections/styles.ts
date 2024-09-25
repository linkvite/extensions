import { rgba } from "polished";
import styled from "styled-components";
import { SelectCollectionImage } from "~components/bookmark/styles";
import { AppText } from "~components/text";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const CollectionsContainer = styled.div<{ theme: ITheme }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    color: ${(p) => p.theme.text_sub};
    background-color: ${(p) => p.theme.background_sub};
`;

export const CollectionsContainerHeader = styled.div<{ theme: ITheme }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

export const CollectionsRefresh = styled.button<{ theme: ITheme }>`
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 35px;
    height: 30px;
    background-color: transparent;
    margin-left: auto;
    color: ${(p) => p.theme.text_sub};
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        color: ${(p) => p.theme.text};
    }

    &:focus {
        outline: none;
        color: ${(p) => p.theme.text};
    }
`;

export const EmptyCollectionsText = styled(AppText)<{ theme: ITheme }>`
    color: ${(p) => p.theme.text_sub};
    text-align: center;
    max-width: 100%;
    margin-top: 10px;
    font-size: ${Fonts.xxs};
`;

export const CollectionItems = styled.div<{ theme: ITheme }>`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 5px;
    overflow-y: scroll;
    height: 250px;
`;

export const CollectionItem = styled.button<{
	theme: ITheme;
	$current: boolean;
}>`
    width: 100%;
    padding: 5px 8px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    border-radius: 8px;
    color: ${(p) => p.theme.text};
    transition: all 0.3s ease-in-out;
    border: 1px solid ${(p) =>
			p.$current ? rgba(Colors.primary, 0.6) : "transparent"};
    background-color: ${(p) =>
			p.$current ? rgba(Colors.primary, 0.1) : p.theme.trans_bg};

    &:hover {
        border: 1px solid ${(p) =>
					p.$current ? rgba(Colors.primary, 0.6) : rgba(p.theme.text_sub, 0.5)};
        cursor: ${(p) => (p.$current ? "default" : "pointer")};
    }

    &:focus {
        outline: none;
        border: 1px solid ${Colors.primary};
    }
`;

export const CollectionItemIcon = styled(SelectCollectionImage)`
    margin-right: 10px;
`;

export const CollectionItemName = styled(AppText)<{ theme: ITheme }>`
    font-size: ${Fonts.xs};
    color: ${(p) => p.theme.text};
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const RemoveCollection = styled.button<{ theme: ITheme }>`
    border: none;
    outline: none;
    padding: 0;
    text-align: center;
    max-width: 100%;
    margin-top: 10px;
    font-size: ${Fonts.xxs};
    text-decoration: underline;
    background-color: transparent;
    color: ${(p) => p.theme.text_sub};
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        color: ${(p) => p.theme.text};
    }
`;

export const NoCollections = styled.div<{ theme: ITheme }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

export const CreateCollectionButton = styled.button<{ theme: ITheme }>`
    border: none;
    outline: none;
    margin-top: 10px;
    border-radius: 5px;
    background-color: transparent;
    text-decoration: underline;
    text-decoration-offset: 0.2rem;
    color: ${(p) => p.theme.text_sub};
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        color: ${(p) => p.theme.text};
    }
`;
