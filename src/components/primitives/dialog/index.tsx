import { IoClose } from "react-icons/io5";
import * as RadixDialog from "@radix-ui/react-dialog";
import {
	DialogClose,
	DialogCloseContainer,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "./styles";
import type { ReactNode } from "react";

type Props = {
	trigger: ReactNode;
	children: ReactNode;
	title: string;
	description?: string;
	minHeight?: number;
};

export function AppDialog({
	children,
	trigger,
	title,
	description,
	minHeight,
}: Props) {
	return (
		<DialogRoot>
			<DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
				{trigger}
			</DialogTrigger>

			<RadixDialog.Portal>
				<DialogOverlay />
				<DialogContent min={minHeight} onClick={(e) => e.stopPropagation()}>
					<DialogTitle>{title}</DialogTitle>
					{description ? (
						<DialogDescription>{description}</DialogDescription>
					) : null}

					{children}

					<DialogCloseContainer asChild>
						<DialogClose aria-label="Close">
							<IoClose size={24} />
						</DialogClose>
					</DialogCloseContainer>
				</DialogContent>
			</RadixDialog.Portal>
		</DialogRoot>
	);
}
