import * as RadixPopover from '@radix-ui/react-popover';
import {
    PopoverRoot,
    PopoverContent,
    PopoverTrigger,
    PopoverArrow
} from './styles';

type Props = {
    trigger: React.ReactNode;
    children: React.ReactNode;
}

export function AppPopover({ children, trigger }: Props) {
    return (
        <PopoverRoot>
            <RadixPopover.Trigger asChild>
                <PopoverTrigger>
                    {trigger}
                </PopoverTrigger>
            </RadixPopover.Trigger>

            <RadixPopover.Portal>
                <PopoverContent sideOffset={5}>
                    {children}

                    <PopoverArrow />
                </PopoverContent>

            </RadixPopover.Portal>
        </PopoverRoot>
    )
}