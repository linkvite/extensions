import {openTab} from '@/lib/tabs';
import {Loader2} from 'lucide-react';
import type {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	InputHTMLAttributes,
	ReactNode,
	TextareaHTMLAttributes,
} from 'react';

export function cn(...c: (string | false | null | undefined)[]) {
	return c.filter(Boolean).join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md';
	loading?: boolean;
};

export function Button({
	variant = 'primary',
	size = 'md',
	loading,
	className,
	children,
	disabled,
	...props
}: ButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled || loading}
			className={cn(
				'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50',
				size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm',
				variant === 'primary' && 'bg-coral text-white hover:bg-coral-bright',
				variant === 'outline' &&
					'border border-line bg-surface hover:bg-elevated',
				variant === 'ghost' &&
					'text-muted hover:bg-surface hover:text-foreground',
				variant === 'danger' &&
					'border border-line text-red-400 hover:bg-red-500/10',
				className,
			)}
			{...props}
		>
			{loading ? <Loader2 className="size-4 animate-spin" /> : null}
			{children}
		</button>
	);
}

const field =
	'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-coral';

export function Input({
	className,
	...props
}: InputHTMLAttributes<HTMLInputElement>) {
	return <input className={cn(field, 'h-9', className)} {...props} />;
}

export function Textarea({
	className,
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(field, 'min-h-16 resize-none', className)}
			{...props}
		/>
	);
}

export function Field({
	label,
	children,
	hint,
}: {label: string; children: ReactNode; hint?: ReactNode}) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: the control is the child
		<label className="flex flex-col gap-1.5">
			<span className="text-xs font-medium text-muted">{label}</span>
			{children}
			{hint ? <span className="text-xs text-muted">{hint}</span> : null}
		</label>
	);
}

export function Switch({
	checked,
	onChange,
	label,
	hint,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label: string;
	hint?: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className="flex w-full items-center justify-between gap-4 py-2 text-left"
		>
			<span>
				<span className="block text-sm">{label}</span>
				{hint ? <span className="block text-xs text-muted">{hint}</span> : null}
			</span>
			<span
				className={cn(
					'relative h-5 w-9 shrink-0 rounded-full transition-colors',
					checked ? 'bg-coral' : 'bg-line',
				)}
			>
				<span
					className={cn(
						'absolute top-0.5 size-4 rounded-full bg-white transition-transform',
						checked ? 'translate-x-4.5' : 'translate-x-0.5',
					)}
				/>
			</span>
		</button>
	);
}

export function Spinner({className}: {className?: string}) {
	return (
		<Loader2
			className={cn('size-5 animate-spin text-muted', className)}
			aria-label="Loading"
		/>
	);
}

export function Center({children}: {children: ReactNode}) {
	return (
		<div className="grid min-h-60 place-items-center p-6 text-center">
			{children}
		</div>
	);
}

/** A link that opens in a normal browser tab, also from the save window. */
export function TabLink({
	href,
	onClick,
	...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {href: string}) {
	return (
		<a
			{...props}
			href={href}
			target="_blank"
			rel="noreferrer"
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented) return;
				e.preventDefault();
				void openTab(href);
			}}
		/>
	);
}
