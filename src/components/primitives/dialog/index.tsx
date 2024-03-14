import { IoClose } from "react-icons/io5";
import * as RadixDialog from '@radix-ui/react-dialog';
import {
    DialogClose,
    DialogCloseContainer,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogRoot,
    DialogTitle,
    DialogTrigger
} from './styles';

type Props = {
    trigger: React.ReactNode;
    children: React.ReactNode;
    title: string;
    description: string;
}

export function AppDialog({ children, trigger, title, description }: Props) {
    return (
        <DialogRoot>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <RadixDialog.Portal>
                <DialogOverlay />
                <DialogContent>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>

                    {children}

                    <DialogCloseContainer asChild>
                        <DialogClose aria-label='Close'>
                            <IoClose size={24} />
                        </DialogClose>
                    </DialogCloseContainer>
                </DialogContent>
            </RadixDialog.Portal>
        </DialogRoot>
    )
}
