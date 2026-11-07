import type {Schemas} from '@linkvite/js';

export type User = Schemas['User'];

/**
 * A signed-in account. `session` comes from a password or QR sign-in
 * (first-party refresh tokens); `oauth` from "Continue with Linkvite".
 * Refresh tokens are single-use: only the background worker refreshes.
 */
export type Session = {
	kind: 'session' | 'oauth';
	user: User;
	accessToken: string;
	refreshToken: string;
};

export type Theme = 'system' | 'light' | 'dark';

export type Settings = {
	/** Save the page as soon as the popup opens. */
	autoSave: boolean;
	/** Close the popup window after saving. */
	autoClose: boolean;
	theme: Theme;
	/** Where new bookmarks go; null: Unsorted. */
	defaultCollection: {id: string; name: string} | null;
	/** Read the page's own metadata (local) or ask Linkvite to fetch it (server). */
	parseMode: 'local' | 'server';
};

export const DEFAULT_SETTINGS: Settings = {
	autoSave: false,
	autoClose: true,
	theme: 'system',
	defaultCollection: null,
	parseMode: 'local',
};

export const sessionItem = storage.defineItem<Session | null>('local:session', {
	fallback: null,
});
export const settingsItem = storage.defineItem<Settings>('local:settings', {
	fallback: DEFAULT_SETTINGS,
});

export async function getSettings(): Promise<Settings> {
	return {...DEFAULT_SETTINGS, ...(await settingsItem.getValue())};
}

export async function updateSettings(
	patch: Partial<Settings>,
): Promise<Settings> {
	const next = {...(await getSettings()), ...patch};
	await settingsItem.setValue(next);
	return next;
}
