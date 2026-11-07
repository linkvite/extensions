import {backgroundClient} from '@/lib/api';
import {
	accessToken,
	completeSession,
	refresh,
	signInWithOAuth,
	signInWithPassword,
	signOut,
} from '@/lib/auth';
import {APP_URL} from '@/lib/env';
import {listen} from '@/lib/messages';

type MenuId =
	| 'save:page'
	| 'save:link'
	| 'save:image'
	| 'save:tabs'
	| 'open:options'
	| 'open:app';

const MENUS: {
	id: MenuId;
	title: string;
	context: 'page' | 'link' | 'image' | 'action';
}[] = [
	{id: 'save:page', title: 'Save page to Linkvite', context: 'page'},
	{id: 'save:link', title: 'Save link to Linkvite', context: 'link'},
	{id: 'save:image', title: 'Save image to Linkvite', context: 'image'},
	{id: 'save:tabs', title: 'Save all tabs', context: 'action'},
	{id: 'open:options', title: 'Options', context: 'action'},
	{id: 'open:app', title: 'Open Linkvite', context: 'action'},
];

/** Open the popup UI as a small window (context menus can't open the action popup). */
async function openWindow(params: Record<string, string>) {
	const url = browser.runtime.getURL(
		`/popup.html?${new URLSearchParams({window: '1', ...params})}`,
	);
	const width = 420;
	const height = 640;
	const cur = await browser.windows.getCurrent().catch(() => undefined);
	await browser.windows.create({
		url,
		type: 'popup',
		width,
		height,
		top: cur
			? Math.round((cur.top ?? 0) + ((cur.height ?? height) - height) / 2)
			: undefined,
		left: cur
			? Math.round((cur.left ?? 0) + ((cur.width ?? width) - width) / 2)
			: undefined,
	});
}

export default defineBackground(() => {
	listen({
		'auth:token': () => accessToken(),
		'auth:refresh': () => refresh(),
		'auth:password': (r) => signInWithPassword(r.identifier, r.password),
		'auth:oauth': () => signInWithOAuth(),
		'auth:complete': (r) =>
			completeSession(r.user, r.accessToken, r.refreshToken),
		'auth:signout': async () => {
			await signOut();
			return null;
		},
	});

	browser.runtime.onInstalled.addListener(async () => {
		await browser.contextMenus.removeAll();
		for (const m of MENUS)
			browser.contextMenus.create({
				id: m.id,
				title: m.title,
				contexts: [m.context],
			});
	});

	browser.contextMenus.onClicked.addListener(async (info, tab) => {
		switch (info.menuItemId as MenuId) {
			case 'save:page':
				if (tab?.id) await openWindow({page: 'save', tabId: String(tab.id)});
				break;
			case 'save:link':
				if (info.linkUrl)
					await openWindow({
						page: 'link',
						url: info.linkUrl,
						text: info.selectionText ?? '',
					});
				break;
			case 'save:image':
				if (info.srcUrl)
					await openWindow({
						page: 'image',
						url: info.srcUrl,
						from: tab?.url ?? '',
					});
				break;
			case 'save:tabs':
				await openWindow({page: 'tabs'});
				break;
			case 'open:options':
				await browser.runtime.openOptionsPage();
				break;
			case 'open:app':
				await browser.tabs.create({url: APP_URL});
				break;
		}
	});

	// "lv <query>" in the address bar: search your bookmarks
	browser.omnibox?.setDefaultSuggestion({description: 'Search Linkvite'});
	browser.omnibox?.onInputChanged.addListener(async (text, suggest) => {
		const q = text.trim();
		if (!q || !(await accessToken())) return;
		try {
			const res = await backgroundClient().search.search({
				q,
				path: 'bookmarks',
				limit: 8,
				sort: '-updated',
			});
			suggest(
				(res.bookmarks ?? []).map((b) => ({
					content: b.url,
					description: `${escapeXml(b.title || b.url)} <url>${escapeXml(b.url)}</url>`,
				})),
			);
		} catch {
			// no suggestions
		}
	});
	browser.omnibox?.onInputEntered.addListener(async (text, disposition) => {
		const url = /^https?:\/\//i.test(text)
			? text
			: `${APP_URL}/search?q=${encodeURIComponent(text)}`;
		if (disposition === 'currentTab') await browser.tabs.update({url});
		else
			await browser.tabs.create({
				url,
				active: disposition === 'newForegroundTab',
			});
	});
});

function escapeXml(s: string) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
