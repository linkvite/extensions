import {pageClient} from '@/lib/api';
import {
	type Session,
	type Settings,
	getSettings,
	sessionItem,
	settingsItem,
	updateSettings,
} from '@/lib/storage';
import {useEffect, useMemo, useState} from 'react';

/** The signed-in account (undefined while loading), kept in sync with storage. */
export function useSession(): Session | null | undefined {
	const [s, setS] = useState<Session | null | undefined>(undefined);
	useEffect(() => {
		sessionItem.getValue().then(setS);
		return sessionItem.watch(setS);
	}, []);
	return s;
}

export function useSettings(): [
	Settings | null,
	(patch: Partial<Settings>) => Promise<void>,
] {
	const [s, setS] = useState<Settings | null>(null);
	useEffect(() => {
		getSettings().then(setS);
		return settingsItem.watch(() => getSettings().then(setS));
	}, []);
	return [s, async (patch) => setS(await updateSettings(patch))];
}

/** Applies the theme setting to <html data-theme>. */
export function useTheme(theme: Settings['theme'] | undefined) {
	useEffect(() => {
		const apply = () => {
			const dark =
				theme === 'dark' ||
				(theme !== 'light' &&
					matchMedia('(prefers-color-scheme: dark)').matches);
			document.documentElement.dataset.theme = dark ? 'dark' : 'light';
		};
		apply();
		const mq = matchMedia('(prefers-color-scheme: dark)');
		mq.addEventListener('change', apply);
		return () => mq.removeEventListener('change', apply);
	}, [theme]);
}

export function useClient() {
	return useMemo(() => pageClient(), []);
}

export function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}
