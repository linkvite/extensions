import {send} from '@/lib/messages';
import type {Session, Settings, Theme} from '@/lib/storage';
import {LogOut} from 'lucide-react';
import {useState} from 'react';
import {CollectionPicker} from './collection-picker';
import {Button, Field, Switch, cn} from './ui';

export function OptionsPage({
	session,
	settings,
	onSettings,
}: {
	session: Session;
	settings: Settings;
	onSettings: (p: Partial<Settings>) => void;
}) {
	const [busy, setBusy] = useState(false);
	return (
		<div className="flex flex-col gap-5">
			<section className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
				{session.user.avatar ? (
					<img
						src={session.user.avatar}
						alt=""
						className="size-9 rounded-full object-cover"
					/>
				) : (
					<span className="grid size-9 place-items-center rounded-full bg-coral-wash font-semibold text-coral">
						{(session.user.name || session.user.username)
							.charAt(0)
							.toUpperCase()}
					</span>
				)}
				<span className="min-w-0 flex-1">
					<span className="block truncate text-sm font-medium">
						{session.user.name || session.user.username}
					</span>
					<span className="block truncate text-xs text-muted">
						@{session.user.username}
					</span>
				</span>
				<Button
					variant="ghost"
					size="sm"
					loading={busy}
					onClick={async () => {
						setBusy(true);
						await send({type: 'auth:signout'}).catch(() => null);
						setBusy(false);
					}}
				>
					<LogOut className="size-3.5" /> Sign out
				</Button>
			</section>

			<Field label="Save new bookmarks to">
				<CollectionPicker
					value={settings.defaultCollection}
					onChange={(defaultCollection) => onSettings({defaultCollection})}
				/>
			</Field>

			<div className="flex flex-col divide-y divide-line">
				<Switch
					label="Save when the popup opens"
					hint="Saves the page right away; edit it afterwards."
					checked={settings.autoSave}
					onChange={(autoSave) => onSettings({autoSave})}
				/>
				<Switch
					label="Close after saving"
					checked={settings.autoClose}
					onChange={(autoClose) => onSettings({autoClose})}
				/>
				<Switch
					label="Read details from the page"
					hint="Off: Linkvite fetches the page instead (use it for pages that hide their details)."
					checked={settings.parseMode === 'local'}
					onChange={(local) =>
						onSettings({parseMode: local ? 'local' : 'server'})
					}
				/>
			</div>

			<Field label="Theme">
				<div
					className="flex rounded-lg border border-line p-0.5 text-xs"
					aria-label="Theme"
				>
					{(['system', 'light', 'dark'] as Theme[]).map((t) => (
						<button
							key={t}
							type="button"
							aria-pressed={settings.theme === t}
							onClick={() => onSettings({theme: t})}
							className={cn(
								'flex-1 rounded-md py-1.5 capitalize',
								settings.theme === t ? 'bg-surface' : 'text-muted',
							)}
						>
							{t}
						</button>
					))}
				</div>
			</Field>

			<p className="text-xs text-muted">
				Tip: type <kbd className="rounded border border-line px-1">lv</kbd> and
				a space in the address bar to search your bookmarks.
			</p>
		</div>
	);
}
