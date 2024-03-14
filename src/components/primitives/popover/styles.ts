import styled from "styled-components";
import { Fonts, type ITheme } from "~utils/styles";
import * as RadixPopover from "@radix-ui/react-popover";

export const PopoverRoot = styled(RadixPopover.Root)`
    background-color: ${p => p.theme.background};
`;

export const PopoverContent = styled(RadixPopover.Content) <{ theme: ITheme }>`
    width: 50dvw;
    max-width: 300px;
    padding: 15px;
    border-radius: 8px;
    font-size: ${Fonts.xxs};
    background-color: ${p => p.theme.background_sub};
    will-change: transform, opacity;    
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
`;

export const PopoverTrigger = styled.button`
    border: none;
    padding: 0;
    background-color: transparent;

    &:hover {
        cursor: pointer;
    }
`;

export const PopoverArrow = styled(RadixPopover.Arrow) <{ theme: ITheme }>`
    fill: ${p => p.theme.background_sub};
`;
