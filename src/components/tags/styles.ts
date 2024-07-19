import { rgba } from "polished";
import styled from "styled-components";
import { AuthInputField } from "~components/auth/styles";
import { Colors, type ITheme } from "~utils/styles";

export const TagsContainer = styled.form<{ theme: ITheme }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 10px;
    color: ${(p) => p.theme.text_sub};
    background-color: ${(p) => p.theme.background_sub};
`;

export const TagsInputContainer = styled.div<{ theme: ITheme }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    color: ${(p) => p.theme.text_sub};
    border-radius: 8px;
    padding: 8px 8px;
    border: 1px solid ${(p) => p.theme.trans_bg};
    background-color: ${(p) => p.theme.background_sub};
    transition: all 0.3s ease-in-out;

    &:focus-within {
        border-color: ${rgba(Colors.primary, 0.7)};
    }
`;

export const TagsInput = styled(AuthInputField)`
    width: 85%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    padding-right: 8px;
    border-radius: 0px;

    &::placeholder {
        color: ${(p) => p.theme.text_sub};
    }

    &:focus {
        outline: none;
        border: none;
    }
`;

export const TagAddButton = styled.button<{ theme: ITheme; $active: boolean }>`
    border: none;
    padding: 5px 10px;
    width: 15%;
    border-radius: 5px;
    color: ${(p) => p.theme.text};
    transition: all 0.3s ease-in-out;
    background-color: ${Colors.primary};
    opacity: ${(p) => (p.$active ? 1 : 0.7)};

    &:hover {
        opacity: ${(p) => (p.$active ? 0.9 : 0.7)};
        cursor: ${(p) => (p.$active ? "pointer" : "not-allowed")};
    }
`;

export const TagItems = styled.div<{ theme: ITheme }>`
    display: flex;    
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    margin-top: 15px;
    overflow-y: scroll;
    height: 100%;
    max-height: 300px;
`;

export const TagItem = styled.button<{ theme: ITheme; $closeHovered: boolean }>`
    display: flex;
    outline: none;
    align-items: center;
    justify-content: center;
    padding: 1px 5px;
    margin: 0 8px 8px 0;
    border-radius: 5px;
    flex-direction: row;
    border: 1px solid transparent;
    transition: all 0.3s ease-in-out;
    background-color: ${(p) =>
			p.$closeHovered ? Colors.error : p.theme.trans_bg};

    &:hover {
        cursor: pointer;
        border: 1px solid ${(p) =>
					p.$closeHovered ? "transparent" : rgba(p.theme.text_sub, 0.5)};
    }
`;

export const TagItemCloseButton = styled.span`
    display: flex;
    outline: none;
    border: none;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.2);
    margin-left: 5px;
    padding: 2px;
    margin-right: -2px;
    z-index: 1;
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.5);
    }
`;

export const RecentTags = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    width: 100%;
`;

export const RecentTagsHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
`;

export const RecentTagsClear = styled.button<{ theme: ITheme }>`
    border: none;
    padding: 0;
    background-color: transparent;
    color: ${(p) => p.theme.text_sub};
    text-decoration: underline;
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        color: ${Colors.error};
    }
`;
