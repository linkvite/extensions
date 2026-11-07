import {Star, X} from 'lucide-react';
import {useState} from 'react';
import {CollectionPicker, type CollectionRef} from './collection-picker';
import {Field, Input, Textarea, cn} from './ui';

export type Draft = {
	url: string;
	title: string;
	description: string;
	/** Comma-separated, as the API stores them. */
	tags: string;
	cover: string;
	favicon: string;
	starred: boolean;
	collection: CollectionRef;
};

export const emptyDraft = (p: Partial<Draft> = {}): Draft => ({
	url: '',
	title: '',
	description: '',
	tags: '',
	cover: '',
	favicon: '',
	starred: false,
	collection: null,
	...p,
});

/** Title, URL, description, tags, star, collection and cover of a bookmark. */
export function BookmarkForm({
	draft,
	onChange,
	hideUrl,
}: {draft: Draft; onChange: (d: Draft) => void; hideUrl?: boolean}) {
	const set = (p: Partial<Draft>) => onChange({...draft, ...p});
	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-3">
				{draft.cover ? (
					<img
						src={draft.cover}
						alt=""
						className="h-16 w-24 shrink-0 rounded-lg border border-line object-cover"
						onError={() => set({cover: ''})}
					/>
				) : null}
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<Input
						aria-label="Title"
						placeholder="Title"
						value={draft.title}
						onChange={(e) => set({title: e.target.value})}
						className="font-medium"
					/>
					{hideUrl ? null : (
						<p className="flex items-center gap-1.5 truncate text-xs text-muted">
							{draft.favicon ? (
								<img
									src={draft.favicon}
									alt=""
									className="size-3.5"
									onError={() => set({favicon: ''})}
								/>
							) : null}
							<span className="truncate">{draft.url}</span>
						</p>
					)}
				</div>
				<button
					type="button"
					aria-label={draft.starred ? 'Unstar' : 'Star'}
					aria-pressed={draft.starred}
					onClick={() => set({starred: !draft.starred})}
					className="self-start rounded-md p-1.5 hover:bg-surface"
				>
					<Star
						className={cn(
							'size-5',
							draft.starred ? 'fill-amber-400 text-amber-400' : 'text-muted',
						)}
					/>
				</button>
			</div>

			<Field label="Collection">
				<CollectionPicker
					value={draft.collection}
					onChange={(collection) => set({collection})}
				/>
			</Field>

			<Field label="Tags">
				<TagInput value={draft.tags} onChange={(tags) => set({tags})} />
			</Field>

			<Field label="Description">
				<Textarea
					value={draft.description}
					onChange={(e) => set({description: e.target.value})}
					rows={3}
				/>
			</Field>
		</div>
	);
}

function TagInput({
	value,
	onChange,
}: {value: string; onChange: (v: string) => void}) {
	const tags = value
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);
	const [text, setText] = useState('');
	const add = (t: string) => {
		const clean = t.trim().replace(/,/g, '');
		if (clean && !tags.includes(clean)) onChange([...tags, clean].join(','));
		setText('');
	};
	return (
		<div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 focus-within:border-coral">
			{tags.map((t) => (
				<span
					key={t}
					className="inline-flex items-center gap-1 rounded-full bg-coral-wash px-2 py-0.5 text-xs text-coral"
				>
					{t}
					<button
						type="button"
						aria-label={`Remove ${t}`}
						onClick={() => onChange(tags.filter((x) => x !== t).join(','))}
					>
						<X className="size-3" />
					</button>
				</span>
			))}
			<input
				aria-label="Add a tag"
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ',') {
						e.preventDefault();
						add(text);
					} else if (e.key === 'Backspace' && !text && tags.length) {
						onChange(tags.slice(0, -1).join(','));
					}
				}}
				onBlur={() => text && add(text)}
				placeholder={tags.length ? '' : 'Add tags'}
				className="min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
			/>
		</div>
	);
}
