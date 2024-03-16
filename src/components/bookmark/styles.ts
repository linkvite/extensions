import styled from "styled-components";
import { AppText } from "~components/text";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const InputContainer = styled.div<{ theme: ITheme, $isURL?: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border-radius: 10px;
    background-color: ${p => p.theme.background_sub};
    margin-top: 15px;
`;

export const InputField = styled.input <{ theme: ITheme }>`
    width: 100%;
    height: auto;
    max-height: 100px;
    padding: 10px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    font-size: ${Fonts.xs};
    color: ${p => p.theme.text};
    border: none;

    &::placeholder {
        color: ${p => p.theme.text_sub};
    }

    &:focus {
        outline: none;
    }
`;

export const InputFieldLine = styled.div<{ theme: ITheme, $isName?: boolean }>`
    width: 98%;
    height: .75px;
    background-color: ${p => p.theme.trans_bg_opp};
    margin: ${p => p.$isName ? '5px 0 5px 0' : '0 0 0 auto'};
`;

export const BookmarkCoverMainContainer = styled.div<{ theme: ITheme }>`
    width: 100%;
    height: auto;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    border-radius: 10px;
    padding: 5px;
    background-color: ${p => p.theme.background_sub};
`;

export const BookmarkCoverContainer = styled.div`
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    border-radius: 10px;
`

export const BookmarkNewImage = styled.img <{ theme: ITheme }>`
    width: 100%;
    height: 200px;
    border-radius: 8px;
    object-fit: cover;
    background-color: ${p => p.theme.trans_bg};
`;

export const BookmarkNewImageIcon = styled.div`
    border-radius: 8px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.5);
`;

export const BookmarkSubmitButton = styled.button`
    border: none;
    margin-top: 15px;
    background-color: ${Colors.primary};
    border-radius: 8px;
    height: 50px;
    width: 100%;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-in-out;
    ${(p: { disabled?: boolean }) => `
        opacity: ${p.disabled ? 0.5 : 1};

        &:hover {
            cursor: ${p.disabled ? 'not-allowed' : 'pointer'};
            opacity: ${p.disabled ? 0.5 : 0.9};
        }
    `};
`;

export const BookmarkSubmitButtonText = styled(AppText)`
    font-weight: 600;
    color: ${Colors.light};
    font-size: ${Fonts.xs};
`;

export const BookmarkDeleteButton = styled.button<{ theme: ITheme; disabled?: boolean }>`
    border: none;
    margin-top: 15px;
    margin-bottom: 5px;
    background-color: transparent;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    color: ${Colors.error};
    font-size: ${Fonts.xxs};
    font-weight: 600;
    text-align: center;
    text-decoration: underline;
    transition: all 0.3s ease-in-out;
    align-self: center;
    opacity: ${p => p.disabled ? 0.5 : 1};

    &:hover {
        opacity: ${p => p.disabled ? 0.5 : 1};
        cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
        color: ${p => p.disabled ? Colors.error : p.theme.text};
    }
`;

export const BookmarkActionsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 15px;
`;

export const BookmarkActionsSubContainer = styled.div`
    display: flex;
    width: 49%;
    flex-direction: column;
    align-self: flex-start;
`;

export const BookmarkAction = styled.div`
    padding: 10px;
    width: 100%;
    border-radius: 8px;
    margin-bottom: 15px;
    background-color: ${p => p.theme.background_sub};
`;
