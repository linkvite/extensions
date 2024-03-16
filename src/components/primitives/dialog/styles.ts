import styled, { keyframes } from "styled-components";
import * as RadixDialog from '@radix-ui/react-dialog';
import { Fonts, type ITheme } from "~utils/styles";

export const DialogRoot = styled(RadixDialog.Root)`
    display: inline-block;
`;

export const DialogTrigger = styled(RadixDialog.Trigger)`;
    &:hover {
        cursor: pointer;
    }
`;

const overlayShow = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

export const DialogOverlay = styled(RadixDialog.Overlay)`
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    inset: 0;
    position: fixed;
    inset: 0;
    animation: ${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const contentShow = keyframes`
    from {
        opacity: 0;
        transform: translate(-50 %, -48 %) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translate(-50 %, -50 %) scale(1);
    }
`;

export const DialogContent = styled(RadixDialog.Content) <{ theme: ITheme; min?: number }>`
    background-color: ${p => p.theme.background_sub};
    border-radius: 0.5rem;
    box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    position: fixed;
    top: 50%;
    left: 50%;
    padding: 15px;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 400px;
    max-height: 600px;
    min-height: ${p => p.min ? p.min + 'px' : 'auto'};
    animation: ${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);

    &:focus {
        outline: none;
    }
`;

export const DialogTitle = styled.p<{ theme: ITheme }>`
    margin: 0;
    font-weight: 500;
    color: ${p => p.theme.text};
    font-size: ${Fonts.sm};
    margin-bottom: 5px;
`;

export const DialogDescription = styled.p<{ theme: ITheme }>`
    margin-bottom: 5px;
    color: ${p => p.theme.text_sub};
    font-size: ${Fonts.xxs};
    line-height: 1.5;
`;

export const DialogCloseContainer = styled(RadixDialog.Close)`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 5px;
    right: 5px;
`;

export const DialogClose = styled.button<{ theme: ITheme }>`
    border: none;
    padding: 5px;
    background-color: transparent;
    color: ${p => p.theme.text_sub};
    transition: all 0.3s ease-in-out;

    &:hover {
        cursor: pointer;
        color: ${p => p.theme.text};
    }
`;
