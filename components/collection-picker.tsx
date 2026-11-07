import type {Schemas} from '@linkvite/js';
import {Check, ChevronDown, FolderOpen, Inbox, Plus} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'sonner';
import {errorMessage, useClient} from './hooks';
import {Input, Spinner, cn} from './ui';

export type CollectionRef = {id: string; name: string} | null;

type Collection = Schemas['CollectionResponse'];

let cache: Collection[] | null = null;

/** Choose a collection (or Unsorted), searching your collections or creating one. */
export function CollectionPicker({
	value,
	onChange,
}: {value: CollectionRef; onChange: (c: CollectionRef) => void}) {
	const lv = useClient();
	const [open, setOpen] = useState(false);
	const [q, setQ] = useState('');
	const [all, setAll] = useState<Collection[] | null>(cache);
	const [creating, setCreating] = useState(false);
	const box = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open || all) return;
		lv.collections
			.getAll()
			.then((list) => {
				cache = list;
				setAll(cache);
			})
			.catch((err) => toast.error(errorMessage(err)));
	}, [open, all, lv]);

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (box.current && !box.current.contains(e.target as Node))
				setOpen(false);
		};
		document.addEventListener('mousedown', close);
		return () => document.removeEventListener('mousedown', close);
	}, [open]);

	const shown = useMemo(() => {
		const s = q.trim().toLowerCase();
		return (all ?? [])
			.filter((c) => !s || c.name.toLowerCase().includes(s))
			.slice(0, 50);
	}, [all, q]);
	const exact = (all ?? []).some(
		(c) => c.name.toLowerCase() === q.trim().toLowerCase(),
	);

	const pick = (c: CollectionRef) => {
		onChange(c);
		setOpen(false);
		setQ('');
	};

	return (
		<div ref={box} className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex h-9 w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 text-left text-sm hover:border-coral/60"
				aria-expanded={open}
			>
				{value ? (
					<FolderOpen className="size-4 text-coral" />
				) : (
					<Inbox className="size-4 text-muted" />
				)}
				<span className="flex-1 truncate">{value?.name ?? 'Unsorted'}</span>
				<ChevronDown className="size-4 text-muted" />
			</button>
			{open ? (
				<div className="absolute inset-x-0 top-10 z-20 flex max-h-72 flex-col overflow-hidden rounded-lg border border-line bg-elevated shadow-xl">
					<div className="border-b border-line p-2">
						<Input
							autoFocus
							placeholder="Find or create a collection"
							value={q}
							onChange={(e) => setQ(e.target.value)}
						/>
					</div>
					<ul className="flex-1 overflow-y-auto p-1">
						<Option
							selected={!value}
							onClick={() => pick(null)}
							icon={<Inbox className="size-4 text-muted" />}
						>
							Unsorted
						</Option>
						{all === null ? (
							<li className="grid place-items-center py-4">
								<Spinner className="size-4" />
							</li>
						) : (
							shown.map((c) => (
								<Option
									key={c.id}
									selected={value?.id === c.id}
									onClick={() => pick({id: c.id, name: c.name})}
									icon={<FolderOpen className="size-4 text-coral" />}
								>
									{c.name}
								</Option>
							))
						)}
						{q.trim() && !exact ? (
							<Option
								onClick={async () => {
									setCreating(true);
									try {
										const c = await lv.collections.create({name: q.trim()});
										cache = [c, ...(cache ?? [])];
										setAll(cache);
										pick({id: c.id, name: c.name});
										toast.success(`Created ${c.name}`);
									} catch (err) {
										toast.error(errorMessage(err));
									} finally {
										setCreating(false);
									}
								}}
								icon={
									creating ? (
										<Spinner className="size-4" />
									) : (
										<Plus className="size-4 text-coral" />
									)
								}
							>
								Create “{q.trim()}”
							</Option>
						) : null}
					</ul>
				</div>
			) : null}
		</div>
	);
}

function Option({
	children,
	icon,
	selected,
	onClick,
}: {
	children: React.ReactNode;
	icon: React.ReactNode;
	selected?: boolean;
	onClick: () => void;
}) {
	return (
		<li>
			<button
				type="button"
				aria-pressed={!!selected}
				onClick={onClick}
				className={cn(
					'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface',
				)}
			>
				{icon}
				<span className="flex-1 truncate">{children}</span>
				{selected ? <Check className="size-4 text-coral" /> : null}
			</button>
		</li>
	);
}
