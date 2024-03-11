import styled from "styled-components";
import { AppText } from "~components/text";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const AuthContainer = styled.form`
    width: 100%;
    max-width: 540px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-self: center;
`;

export const AuthTitle = styled(AppText)`
    width: 100%;
    max-width: 100%;
    text-align: left;
`;

export const AuthDescription = styled(AppText)`
    text-align: left;
    max-width: 100%;
    width: 100%;
    margin-top: .5rem;
    color: ${p => p.theme.text_sub};
    
`;

export const AuthErrorText = styled(AppText)`
    width: 100%;
    max-width: 100%;
    width: 100%;
    margin-top: 1rem;
    font-weight: normal;
    margin-bottom: -1rem;
    font-size: ${Fonts.xs};
    color: ${Colors.error};
`;

export const AuthInputContainer = styled.div<{ $first?: boolean; theme: ITheme }>`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    color: ${p => p.theme.text_sub};
    margin-top: ${p => p.$first ? "1rem" : "0"};
`;

export const AuthInputField = styled.input<{ $hasError?: boolean; theme: ITheme }>`
    width: 100%;
    border: none;
    margin-top: .25rem;
    border-radius: .5rem;
    padding: .75rem;
    font-size: ${Fonts.xs};
    background-color: transparent;
    transition: all 0.3s ease-in-out;
    margin: 0.5rem 0;
    outline: none;
    box-shadow: none;
    &:focus {
        border: 1px solid ${Colors.primary};
    }

    &::placeholder {
        color: ${Colors.light_divider};
    }

    color: ${p => p.theme.text};
    border: 1px solid ${p => (p.$hasError ? Colors.error : p.theme.trans_bg)};
`;

export const AuthInputLabel = styled.label<{ $second?: boolean; theme: ITheme }>`
    font-size: ${Fonts.xxs};
    color: ${p => p.theme.text_sub};
    margin-top: ${p => p.$second ? ".75rem" : "0"};
`;

export const AuthPasswordIcon = styled.div`
    top: calc(50% + 0.2rem);
    right: 3%;
    cursor: pointer;
    position: absolute;
    font-size: ${Fonts.sm};
`;

export const AuthSubmitButton = styled.button`
    padding: 0;
    cursor: pointer;
    height: 2.75rem;
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 1.5rem;
    margin-bottom: .5rem;
    border-radius: .5rem;
    justify-content: center;
    transition: all .3s ease-in-out;
    color: ${Colors.light};
    background-color: ${Colors.primary};
    border: 1px solid transparent;
    &:hover {
        opacity: 0.8;
    }
`;

export const AuthSignUpContainer = styled.div`
    width: 100%;
    flex-direction: row;
    margin-bottom: 1.25rem;
`;

export const AuthSignUpText = styled.button<{ $second?: boolean; theme: ITheme }>`
    padding: 0;
    font-size: ${Fonts.xxs};
    border: 1px solid transparent;
    background-color: transparent;
    transition: all .3s ease-in-out;
    margin-left: ${p => p.$second ? "0.35rem" : "0"};
    color: ${p => p.$second ? Colors.primary : p.theme.text_sub};

    &:hover {
        cursor: ${p => p.$second ? "pointer" : "default"};
        text-decoration: ${p => p.$second ? "underline" : "none"};
    }
`;
