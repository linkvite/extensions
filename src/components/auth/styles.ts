import { rgba } from "polished";
import styled, { keyframes } from "styled-components";
import { AppText } from "~components/text";
import { settingStore } from "~stores";
import { Colors, Fonts, type ITheme } from "~utils/styles";

export const AuthContainer = styled.form`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-self: center;
    margin-top: 1.5rem;
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
        border: 1px solid ${rgba(Colors.primary, 0.7)};
    }

    &::placeholder {
        color: ${p => p.theme.text_sub};
    }

    color: ${p => p.theme.text};
    border: 1px solid ${p => (p.$hasError ? Colors.error : rgba(p.theme.trans_bg, settingStore.theme.get() === "dark" ? 0.5 : 1))};
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
    margin-left: ${p => p.$second ? "0.25rem" : "0"};
    color: ${p => p.theme.text_sub};
    text-decoration: ${p => p.$second ? "underline" : "none"};

    &:hover {
        cursor: ${p => p.$second ? "pointer" : "default"};
        color: ${p => p.$second ? p.theme.text : p.theme.text_sub};
    }
`;

const Centered = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const AuthQrContainer = styled(Centered) <{ $notModal?: boolean }>`
    flex-direction: column;
    width: 100%;
`;

export const QRContainer = styled(Centered) <{ $qr?: boolean }>`
    border-radius: .75rem;
    margin-top: 2rem;
    width: 22rem;
    height: 22rem;
    padding: 1rem;
    max-width: 90%;
    max-height: 90%;
    background-color: ${p => p.$qr ? Colors.light : "transparent"};
    box-shadow: ${p => p.$qr ? "0 0.1rem 0.5rem rgba(0,0,0,0.1);" : "none"};
`;

const slideUp = keyframes`
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const QRAuthImage = styled.img`
    opacity: 0;
    width: 20rem;
    height: 20rem;
    object-fit: cover;
    border-radius: 100%;
    transition: all .3s ease-in-out;
    animation: ${slideUp} .5s ease-in-out forwards;
`;

export const QRSubTitle = styled(AppText)`
    max-width: 80%;
    margin-top: 1.5rem;
    text-align: center;
`;

export const AlreadyRegistered = styled.button`
    font-size: ${Fonts.xxs};
    color: ${Colors.primary};
    font-weight: bold;
    text-align: center;
    text-decoration: underline;
    cursor: pointer;
    transition: all .2s ease-in-out;
    margin: .5rem 0;
    background-color: transparent;
    border: 1px solid transparent;
    padding: 0;
    width: auto;
    &:hover {
        opacity: 0.8;
    }
`;

export const AuthMethodContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;
`;
