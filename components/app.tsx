import {APP_URL} from '@/lib/env';
import {Settings2} from 'lucide-react';
import {Toaster} from 'sonner';
import {useSession, useSettings, useTheme} from './hooks';
import {OptionsPage} from './options';
import {ImagePage, LinkPage, SavePage, TabsPage} from './pages';
import {SignIn} from './sign-in';
import {Center, Spinner, TabLink, cn} from './ui';

export type Page = 'save' | 'link' | 'image' | 'tabs' | 'options';

const TITLES: Record<Page, string> = {
	save: 'Save to Linkvite',
	link: 'Save link',
	image: 'Save image',
	tabs: 'Save all tabs',
	options: 'Options',
};

/** The popup (and the windows context menus open): one page chosen by ?page=. */
export function App({
	page,
	params,
	fullPage,
}: {page: Page; params: URLSearchParams; fullPage?: boolean}) {
	const session = useSession();
	const [settings, setSettings] = useSettings();
	useTheme(settings?.theme);

	const frame = cn(
		'flex flex-col bg-background',
		fullPage ? 'min-h-screen' : 'w-[380px] min-h-[420px]',
	);

	if (session === undefined || !settings) {
		return (
			<div className={frame}>
				<Center>
					<Spinner />
				</Center>
			</div>
		);
	}

	return (
		<div className={frame}>
			<Toaster
				theme={
					document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
				}
				position="bottom-center"
				richColors
			/>
			{session === null ? (
				<SignIn />
			) : (
				<>
					<header className="flex items-center gap-2 border-b border-line px-4 py-3">
						<TabLink href={APP_URL} className="flex items-center gap-2">
							<img
								src="/icon/32.png"
								alt="Linkvite"
								className="size-5 rounded"
							/>
						</TabLink>
						<h1 className="flex-1 text-sm font-semibold">{TITLES[page]}</h1>
						{page !== 'options' && !fullPage ? (
							<button
								type="button"
								aria-label="Options"
								onClick={() => browser.runtime.openOptionsPage()}
								className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-foreground"
							>
								<Settings2 className="size-4" />
							</button>
						) : null}
					</header>
					<main className="flex-1 p-4">
						{page === 'save' ? (
							<SavePage
								tabId={Number(params.get('tabId')) || undefined}
								settings={settings}
								onSettings={setSettings}
							/>
						) : page === 'link' ? (
							<LinkPage
								url={params.get('url') ?? ''}
								text={params.get('text') ?? ''}
								settings={settings}
							/>
						) : page === 'image' ? (
							<ImagePage
								url={params.get('url') ?? ''}
								from={params.get('from') ?? ''}
								settings={settings}
							/>
						) : page === 'tabs' ? (
							<TabsPage settings={settings} />
						) : (
							<OptionsPage
								session={session}
								settings={settings}
								onSettings={setSettings}
							/>
						)}
					</main>
				</>
			)}
		</div>
	);
}
