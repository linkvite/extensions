import {APP_URL} from '@/lib/env';
import {activeTab, isSavable, pageInfo} from '@/lib/page';
import type {Settings} from '@/lib/storage';
import {openTab} from '@/lib/tabs';
import type {Schemas} from '@linkvite/js';
import {
	Check,
	ExternalLink,
	Globe,
	ImageIcon,
	Layers,
	Trash2,
} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {BookmarkForm, type Draft, emptyDraft} from './bookmark-form';
import {CollectionPicker, type CollectionRef} from './collection-picker';
import {errorMessage, useClient} from './hooks';
import {Button, Center, Spinner, cn} from './ui';

type Bookmark = Schemas['BookmarkResponse'];

/** Close a popup window (context-menu pages) or the action popup after saving. */
function done(settings: Settings) {
	if (settings.autoClose) setTimeout(() => window.close(), 900);
}

const fromBookmark = (b: Bookmark): Draft =>
	emptyDraft({
		url: b.url,
		title: b.title,
		description: b.description,
		tags: b.tags,
		cover: b.thumbnail,
		favicon: b.icon,
		starred: b.starred,
		collection: b.collection_id
			? {id: b.collection_id, name: b.collection_name ?? 'Collection'}
			: null,
	});

/* ------------------------------------------------------------- current page -- */

type SaveState =
	| {kind: 'loading'}
	| {kind: 'unsupported'}
	| {kind: 'new'; draft: Draft}
	| {kind: 'saved'; bookmark: Bookmark; draft: Draft; justSaved: boolean};

/** Save the current tab (the popup), or the tab a context menu was opened on. */
export function SavePage({
	tabId,
	settings,
	onSettings,
}: {
	tabId?: number;
	settings: Settings;
	onSettings: (p: Partial<Settings>) => void;
}) {
	const lv = useClient();
	const [state, setState] = useState<SaveState>({kind: 'loading'});
	const [busy, setBusy] = useState<'' | 'save' | 'delete'>('');
	// latest settings without reloading the page when, say, autoClose changes
	const settingsRef = useRef(settings);
	settingsRef.current = settings;

	const create = useCallback(
		(d: Draft) =>
			lv.bookmarks.create({
				url: d.url,
				title: d.title,
				description: d.description,
				tags: d.tags,
				cover: d.cover,
				starred: d.starred,
				collection: d.collection?.id,
			}),
		[lv],
	);

	const load = useCallback(
		async (mode: Settings['parseMode']) => {
			setState({kind: 'loading'});
			const tab = tabId
				? await browser.tabs.get(tabId).catch(() => undefined)
				: await activeTab();
			const url = tab?.url;
			if (!tab?.id || !isSavable(url) || !url) {
				setState({kind: 'unsupported'});
				return;
			}
			try {
				const ex = await lv.bookmarks.exists({url});
				if (ex.exists && ex.bookmark) {
					const b = await lv.bookmarks.get(ex.bookmark.id);
					setState({
						kind: 'saved',
						bookmark: b,
						draft: fromBookmark(b),
						justSaved: false,
					});
					return;
				}
			} catch {
				// can't check: offer to save anyway
			}
			let draft = emptyDraft({
				url,
				title: tab.title ?? '',
				favicon: tab.favIconUrl ?? '',
				collection: settingsRef.current.defaultCollection,
			});
			if (mode === 'local') {
				const info = await pageInfo(tab.id);
				if (info)
					draft = {
						...draft,
						title: info.title || draft.title,
						description: info.description,
						cover: info.image,
						favicon: info.favicon || draft.favicon,
					};
			} else {
				try {
					const m = await lv.parser.parseLink({link: url});
					draft = {
						...draft,
						title: m.title || draft.title,
						description: m.description,
						cover: m.image,
						favicon: m.favicon || draft.favicon,
					};
				} catch (err) {
					toast.error(`Couldn't fetch the page: ${errorMessage(err)}`);
				}
			}
			if (settingsRef.current.autoSave) {
				try {
					const b = await create(draft);
					setState({
						kind: 'saved',
						bookmark: b,
						draft: fromBookmark(b),
						justSaved: true,
					});
					done(settingsRef.current);
					return;
				} catch (err) {
					toast.error(errorMessage(err));
				}
			}
			setState({kind: 'new', draft});
		},
		[tabId, lv, create],
	);

	useEffect(() => {
		void load(settings.parseMode);
	}, [load, settings.parseMode]);

	if (state.kind === 'loading') {
		return (
			<Center>
				<Spinner />
			</Center>
		);
	}
	if (state.kind === 'unsupported') {
		return (
			<Center>
				<div className="flex flex-col items-center gap-2">
					<Globe className="size-6 text-muted" />
					<p className="text-sm">Linkvite can't save this page.</p>
					<p className="text-xs text-muted">
						Only http and https pages can be saved.
					</p>
				</div>
			</Center>
		);
	}

	if (state.kind === 'new') {
		return (
			<div className="flex flex-col gap-4">
				<BookmarkForm
					draft={state.draft}
					onChange={(draft) => setState({kind: 'new', draft})}
				/>
				<div className="flex items-center justify-between gap-2">
					<div
						className="flex rounded-lg border border-line p-0.5 text-xs"
						role="tablist"
						aria-label="Page details from"
					>
						{(['local', 'server'] as const).map((m) => (
							<button
								key={m}
								type="button"
								role="tab"
								aria-selected={settings.parseMode === m}
								title={
									m === 'local'
										? 'Read details from the page itself'
										: 'Let Linkvite fetch the page'
								}
								onClick={() => onSettings({parseMode: m})}
								className={cn(
									'rounded-md px-2.5 py-1',
									settings.parseMode === m ? 'bg-surface' : 'text-muted',
								)}
							>
								{m === 'local' ? 'This page' : 'Linkvite'}
							</button>
						))}
					</div>
					<Button
						loading={busy === 'save'}
						onClick={async () => {
							setBusy('save');
							try {
								const b = await create(state.draft);
								toast.success('Saved to Linkvite');
								setState({
									kind: 'saved',
									bookmark: b,
									draft: fromBookmark(b),
									justSaved: true,
								});
								done(settings);
							} catch (err) {
								toast.error(errorMessage(err));
							} finally {
								setBusy('');
							}
						}}
					>
						Save
					</Button>
				</div>
			</div>
		);
	}

	// already saved: edit, delete or open it
	const b = state.bookmark;
	return (
		<div className="flex flex-col gap-4">
			<p className="flex items-center gap-1.5 text-xs text-muted">
				<Check className="size-3.5 text-coral" />
				{state.justSaved ? 'Saved to Linkvite.' : 'Already in your Linkvite.'}
			</p>
			<BookmarkForm
				draft={state.draft}
				onChange={(draft) => setState({...state, draft})}
			/>
			<div className="flex items-center gap-2">
				<Button
					variant="danger"
					size="sm"
					loading={busy === 'delete'}
					onClick={async () => {
						setBusy('delete');
						try {
							await lv.bookmarks.delete(b.id);
							toast.success('Moved to trash');
							void load(settings.parseMode);
						} catch (err) {
							toast.error(errorMessage(err));
						} finally {
							setBusy('');
						}
					}}
				>
					<Trash2 className="size-3.5" /> Delete
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => void openTab(`${APP_URL}/bookmarks/${b.id}`)}
				>
					<ExternalLink className="size-3.5" /> Open
				</Button>
				<Button
					className="ml-auto"
					loading={busy === 'save'}
					onClick={async () => {
						setBusy('save');
						const d = state.draft;
						try {
							const updated = await lv.bookmarks.update(b.id, {
								name: d.title,
								description: d.description,
								tags: d.tags,
								starred: d.starred,
								collection: d.collection?.id ?? '',
								cover: d.cover !== b.thumbnail ? d.cover : undefined,
							});
							toast.success('Bookmark updated');
							setState({
								kind: 'saved',
								bookmark: updated,
								draft: fromBookmark(updated),
								justSaved: false,
							});
							done(settings);
						} catch (err) {
							toast.error(errorMessage(err));
						} finally {
							setBusy('');
						}
					}}
				>
					Update
				</Button>
			</div>
		</div>
	);
}

/* ----------------------------------------------------------------- a link -- */

/** Context menu "Save link": a link on the page, not the page itself. */
export function LinkPage({
	url,
	text,
	settings,
}: {url: string; text: string; settings: Settings}) {
	const lv = useClient();
	const [draft, setDraft] = useState<Draft | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		const base = emptyDraft({
			url,
			title: text,
			collection: settings.defaultCollection,
		});
		lv.parser
			.parseLink({link: url})
			.then((m) =>
				setDraft({
					...base,
					title: m.title || base.title || url,
					description: m.description,
					cover: m.image,
					favicon: m.favicon,
				}),
			)
			.catch(() => setDraft({...base, title: base.title || url}));
	}, [url, text, lv, settings.defaultCollection]);

	if (!isSavable(url))
		return <Center>Only http and https links can be saved.</Center>;
	if (!draft) {
		return (
			<Center>
				<Spinner />
			</Center>
		);
	}
	return (
		<div className="flex flex-col gap-4">
			<BookmarkForm draft={draft} onChange={setDraft} />
			<Button
				loading={busy}
				onClick={async () => {
					setBusy(true);
					try {
						await lv.bookmarks.create({
							url: draft.url,
							title: draft.title,
							description: draft.description,
							tags: draft.tags,
							cover: draft.cover,
							starred: draft.starred,
							collection: draft.collection?.id,
						});
						toast.success('Link saved');
						done(settings);
					} catch (err) {
						toast.error(errorMessage(err));
					} finally {
						setBusy(false);
					}
				}}
			>
				Save link
			</Button>
		</div>
	);
}

/* ----------------------------------------------------------------- an image -- */

/** Context menu "Save image": uploads the image itself as a file. */
export function ImagePage({
	url,
	from,
	settings,
}: {url: string; from: string; settings: Settings}) {
	const lv = useClient();
	const name = decodeURIComponent(
		url.split('?')[0]?.split('/').pop() || 'image',
	);
	const [draft, setDraft] = useState<Draft>(() =>
		emptyDraft({
			url,
			title: name,
			cover: url,
			description: from ? `From ${from}` : '',
			collection: settings.defaultCollection,
		}),
	);
	const [busy, setBusy] = useState(false);
	return (
		<div className="flex flex-col gap-4">
			<BookmarkForm draft={draft} onChange={setDraft} hideUrl />
			<Button
				loading={busy}
				onClick={async () => {
					setBusy(true);
					try {
						const res = await fetch(url);
						if (!res.ok)
							throw new Error(`Couldn't download the image (${res.status})`);
						const blob = await res.blob();
						const file = new File(
							[blob],
							name.includes('.')
								? name
								: `${name}.${(blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg')}`,
							{
								type: blob.type,
							},
						);
						await lv.bookmarks.createFile({
							file,
							title: draft.title,
							description: draft.description,
							tags: draft.tags,
							starred: draft.starred,
							collection: draft.collection?.id,
						});
						toast.success(
							"Uploading. You'll get a notification when it's ready.",
						);
						done(settings);
					} catch (err) {
						toast.error(errorMessage(err));
					} finally {
						setBusy(false);
					}
				}}
			>
				<ImageIcon className="size-4" /> Save image
			</Button>
		</div>
	);
}

/* ------------------------------------------------------------------ all tabs -- */

type TabRow = {id: number; title: string; url: string; favicon: string};

/** Save every open tab (needs the optional "tabs" permission to read their URLs). */
export function TabsPage({settings}: {settings: Settings}) {
	const lv = useClient();
	const [granted, setGranted] = useState<boolean | null>(null);
	const [tabs, setTabs] = useState<TabRow[]>([]);
	const [off, setOff] = useState<Set<number>>(new Set());
	const [collection, setCollection] = useState<CollectionRef>(
		settings.defaultCollection,
	);
	const [busy, setBusy] = useState(false);

	const read = useCallback(async () => {
		const all = await browser.tabs.query({});
		const seen = new Set<string>();
		setTabs(
			all
				.filter(
					(t) =>
						isSavable(t.url) && t.id && !seen.has(t.url!) && seen.add(t.url!),
				)
				.map((t) => ({
					id: t.id!,
					title: t.title || t.url!,
					url: t.url!,
					favicon: t.favIconUrl ?? '',
				})),
		);
	}, []);

	useEffect(() => {
		browser.permissions.contains({permissions: ['tabs']}).then((ok) => {
			setGranted(ok);
			if (ok) void read();
		});
	}, [read]);

	if (granted === null) {
		return (
			<Center>
				<Spinner />
			</Center>
		);
	}
	if (!granted) {
		return (
			<Center>
				<div className="flex flex-col items-center gap-3">
					<Layers className="size-6 text-muted" />
					<p className="text-sm">
						To save all your tabs, Linkvite needs to read their titles and
						links.
					</p>
					<Button
						onClick={async () => {
							if (await browser.permissions.request({permissions: ['tabs']})) {
								setGranted(true);
								void read();
							}
						}}
					>
						Allow
					</Button>
				</div>
			</Center>
		);
	}

	const chosen = tabs.filter((t) => !off.has(t.id));
	return (
		<div className="flex flex-col gap-3">
			<CollectionPicker value={collection} onChange={setCollection} />
			<ul className="max-h-80 divide-y divide-line overflow-y-auto rounded-lg border border-line">
				{tabs.map((t) => (
					<li key={t.id}>
						<label className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-surface">
							<input
								type="checkbox"
								className="accent-coral"
								checked={!off.has(t.id)}
								onChange={() =>
									setOff((s) => {
										const n = new Set(s);
										if (n.has(t.id)) n.delete(t.id);
										else n.add(t.id);
										return n;
									})
								}
							/>
							{t.favicon ? (
								<img src={t.favicon} alt="" className="size-4" />
							) : (
								<Globe className="size-4 text-muted" />
							)}
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm">{t.title}</span>
								<span className="block truncate text-xs text-muted">
									{t.url}
								</span>
							</span>
						</label>
					</li>
				))}
			</ul>
			<Button
				disabled={!chosen.length}
				loading={busy}
				onClick={async () => {
					setBusy(true);
					try {
						await lv.bookmarks.createFromTabs({
							tabs: chosen.map((t) => ({title: t.title, url: t.url})),
							collection: collection?.id,
						});
						toast.success(
							`Saving ${chosen.length} ${chosen.length === 1 ? 'tab' : 'tabs'}…`,
						);
						done(settings);
					} catch (err) {
						toast.error(errorMessage(err));
					} finally {
						setBusy(false);
					}
				}}
			>
				Save {chosen.length} {chosen.length === 1 ? 'tab' : 'tabs'}
			</Button>
		</div>
	);
}
