import React from 'react';
import { HiOutlineChevronRight } from "react-icons/hi";
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    DropdownMenuArrow,
    DropdownMenuChevron,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuItemIcon,
    DropdownMenuLabel,
    DropdownMenuRightSlot,
    DropdownMenuSeparator,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from './styles';

type Props = {
    children: React.ReactNode;
    trigger: React.ReactNode;
    disabled?: boolean;
}

type WithChildren = {
    children: React.ReactNode;
}

function Root({ children, trigger, disabled }: Props) {
    return (
        <RadixDropdownMenu.Root>
            <DropdownMenuTrigger disabled={disabled}>
                {trigger}
            </DropdownMenuTrigger>

            <Portal>
                <DropdownMenuContent>
                    {children}

                    <DropdownMenuArrow />
                </DropdownMenuContent>
            </Portal>
        </RadixDropdownMenu.Root>
    )
}

function Portal({ children, ...rest }: WithChildren & RadixDropdownMenu.DropdownMenuPortalProps) {
    return (
        <RadixDropdownMenu.Portal
            {...rest}
        >
            {children}
        </RadixDropdownMenu.Portal>
    )
}

interface ICtxMenuItem extends RadixDropdownMenu.DropdownMenuItemProps {
    children: React.ReactNode;
    destructive?: boolean;
    icon?: React.ReactNode;
}

function Item({ children, icon, ...rest }: ICtxMenuItem) {
    return (
        <DropdownMenuItem
            {...rest}
        >
            {icon
                ? <DropdownMenuItemIcon>
                    {icon}
                </DropdownMenuItemIcon>
                : null
            }

            {children}
        </DropdownMenuItem>
    )
}

function Sub({ children, ...rest }: WithChildren & RadixDropdownMenu.DropdownMenuSubProps) {
    return (
        <RadixDropdownMenu.Sub
            {...rest}
        >
            {children}
        </RadixDropdownMenu.Sub>
    )
}

function SubTrigger({ children, ...rest }: WithChildren & RadixDropdownMenu.DropdownMenuSubTriggerProps) {
    return (
        <DropdownMenuSubTrigger
            {...rest}
        >
            {children}
        </DropdownMenuSubTrigger>
    )
}

function SubContent({ children, ...rest }: WithChildren & RadixDropdownMenu.DropdownMenuSubContentProps) {
    return (
        <DropdownMenuSubContent
            {...rest}
        >
            {children}
        </DropdownMenuSubContent>
    )
}

function Separator(props: RadixDropdownMenu.DropdownMenuSeparatorProps) {
    return (
        <DropdownMenuSeparator
            {...props}
        />
    )
}

function Label({ children, ...rest }: WithChildren & RadixDropdownMenu.DropdownMenuLabelProps) {
    return (
        <DropdownMenuLabel
            {...rest}
        >
            {children}
        </DropdownMenuLabel>
    )
}

function RightSlot({ children, destructive = false }: { children: React.ReactNode, destructive?: boolean }) {
    return (
        <DropdownMenuRightSlot
            $destructive={destructive}
            className='lv-context-menu-right-slot'
        >
            {children}
        </DropdownMenuRightSlot>
    )
}

function ChevronRight() {
    return (
        <DropdownMenuChevron>
            <HiOutlineChevronRight size={15} />
        </DropdownMenuChevron>
    )
}

export const DropdownMenu = {
    Root,
    Portal,
    Item,
    Sub,
    SubTrigger,
    SubContent,
    Separator,
    Label,
    RightSlot,
    ChevronRight,
};
