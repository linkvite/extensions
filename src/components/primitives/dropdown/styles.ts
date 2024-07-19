import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import styled from "styled-components";
import { Colors, Fonts, type ITheme } from "~utils/styles";

const menuStyles = `
    width: 100%;
    min-width: 250px;
    overflow: hidden;
    padding: 5px;
    box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
    border-radius: 0.5rem;
    font-size: ${Fonts._3xs};
    z-index: 99999999999;
    animation-name: slideDown;
    animation-duration: 0.6s;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    
    @media (max-width: 768px) {
        min-width: 220px;
    }

    &[data-side='top'] {
        animation-name: slideUp;
    }

    &[data-side='bottom'] {
        animation-name: slideDown;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const menuItemStyles = `
    line-height: 1.5;
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 30px;
    padding: 0 10px;
    position: relative;
    user-select: none;
    outline: none;
    cursor: pointer;
    font-size: ${Fonts.xxs};
    font-weight: 500;
`;

export const DropdownMenuTrigger = styled(RadixDropdownMenu.Trigger)`
    all: unset;

    &:hover {
        cursor: pointer;
    }
`;

export const DropdownMenuContent = styled(RadixDropdownMenu.Content)<{
	theme: ITheme;
}>`
    ${menuStyles}

    border: 1px solid ${(p) => p.theme.trans_bg};
    background-color: ${(p) => p.theme.background};
    min-width: 200px;
`;

export const DropdownMenuSubContent = styled(RadixDropdownMenu.SubContent)<{
	theme: ITheme;
}>`
    ${menuStyles}
    background-color: ${(p) => p.theme.background};
    border: 1px solid ${(p) => p.theme.trans_bg};
`;

export const DropdownMenuItem = styled(RadixDropdownMenu.Item)<{
	$destructive?: boolean;
	theme: ITheme;
}>`
    ${menuItemStyles}

    color: ${(p) => (p.$destructive ? Colors.error : p.theme.text)};

    &[data-disabled] {
        opacity: 0.5;
    }

    &[data-highlighted] {
        color: ${(p) => p.theme.text};
        background-color: ${(p) => p.theme.trans_bg};
    }

    &[data-highlighted] > .lv-context-menu-right-slot {
        color: ${(p) => p.theme.text};
    }
    
    &[data-disabled] .lv-context-menu-right-slot {
        opacity: 0.7;
    }
`;

export const DropdownMenuItemIcon = styled.div`
    margin-right: 10px;
`;

export const DropdownMenuSubTrigger = styled(RadixDropdownMenu.SubTrigger)<{
	theme: ITheme;
}>`
    ${menuItemStyles}

    &[data-state='open'] {
        background-color: ${(p) => p.theme.trans_bg};
        color: ${(p) => p.theme.text};
    }

    &[data-disabled] {
        color: ${(p) => p.theme.text_sub};
    } 

    &[data-highlighted] {
        background-color: ${(p) => p.theme.trans_bg};
        color: ${(p) => p.theme.text};
    }
`;

export const DropdownMenuLabel = styled(RadixDropdownMenu.Label)<{
	theme: ITheme;
}>`
    padding-left: 10px;
    font-size: ${Fonts._3xs};
    line-height: 25px;
    color: ${(p) => p.theme.text_sub};
`;

export const DropdownMenuSeparator = styled(RadixDropdownMenu.Separator)<{
	theme: ITheme;
}>`
    height: 1px;
    margin: 5px;
    background-color: ${(p) => p.theme.trans_bg};
`;

export const DropdownMenuRightSlot = styled.div<{ $destructive?: boolean }>`
    margin-left: auto;
    opacity: 0.7;
    color: ${(p) => (p.$destructive ? Colors.error : p.theme.text)};
`;

export const DropdownMenuChevron = styled.div`
    margin-top: 5px;
`;

export const DropdownMenuArrow = styled(RadixDropdownMenu.Arrow)<{
	theme: ITheme;
}>`
    fill: ${(p) => p.theme.trans_bg};
`;
