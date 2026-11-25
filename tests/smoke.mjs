// End-to-end smoke test: loads the built Chrome extension (.output/chrome-mv3)
// in Chromium with the Linkvite API mocked, then signs in, saves a page the way
// the context menu does, and opens the saved bookmark.
//
//   pnpm build && pnpm test
//
// PW_CHROMIUM_PATH points at a custom Chromium (otherwise Playwright's own).
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {chromium} from 'playwright';

// requests made by the extension's service worker go through context.route
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1';

const ext = path.resolve('.output/chrome-mv3');
const API = 'https://api.linkvite.io';
const PAGE = 'https://example.test/article';

const user = {
	id: 'usr_1',
	name: 'Kay',
	username: 'kayode',
	email: 'k@example.com',
	avatar: '',
	account_type: 'pro',
};
const bookmark = {
	id: 'bmk_1',
	url: PAGE,
	title: 'An article',
	description: 'About things',
	tags: '',
	thumbnail: '',
	icon: '',
	starred: false,
	collection_id: null,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
};
const ok = (data) => ({
	status: 200,
	contentType: 'application/json',
	body: JSON.stringify({ok: true, message: 'ok', data}),
});

const calls = [];
const results = [];
async function step(name, fn) {
	try {
		await fn();
		results.push(['PASS', name]);
	} catch (err) {
		results.push(['FAIL', `${name}: ${err.message.split('\n')[0]}`]);
	}
}

const ctx = await chromium.launchPersistentContext(
	mkdtempSync(path.join(tmpdir(), 'lv-ext-')),
	{
		channel: 'chromium', // new headless, which can load extensions
		executablePath: process.env.PW_CHROMIUM_PATH || undefined,
		headless: true,
		args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
	},
);

await ctx.route(`${API}/**`, (route) => {
	const req = route.request();
	const {pathname} = new URL(req.url());
	const key = `${req.method()} ${pathname}`;
	calls.push(key);
	switch (key) {
		case 'POST /v1/auth/login':
			return route.fulfill(ok({user, access_token: 'at', refresh_token: 'rt'}));
		case 'GET /v1/user':
		case 'GET /v1/user/':
			return route.fulfill(ok(user));
		case 'POST /v1/bookmarks/exists':
			return route.fulfill(ok({exists: false}));
		case 'GET /v1/parser':
			return route.fulfill(
				ok({
					title: 'An article',
					description: 'About things',
					image: '',
					favicon: '',
				}),
			);
		case 'POST /v1/bookmarks':
			return route.fulfill(ok(bookmark));
		case 'GET /v1/bookmarks/bmk_1':
			return route.fulfill(ok(bookmark));
		case 'GET /v1/collections':
			return route.fulfill(ok([]));
		case 'POST /v1/qr-auth/new':
			return route.fulfill(
				ok({endpoint: 'https://app.linkvite.io/qr-auth/x', token: 't'}),
			);
	}
	return route.fulfill({
		status: 404,
		contentType: 'application/json',
		body: '{"ok":false,"error":"unmocked"}',
	});
});
await ctx.route(
	/^https:\/\/(example\.test|app\.linkvite\.io|linkvite\.io)\//,
	(route) =>
		route.fulfill({
			status: 200,
			contentType: 'text/html',
			body: '<title>An article</title><meta name="description" content="About things"><h1>An article</h1>',
		}),
);
await ctx.route(/ws\.linkvite\.io/, (route) => route.abort());

let [sw] = ctx.serviceWorkers();
await step('service worker starts', async () => {
	sw ??= await ctx.waitForEvent('serviceworker', {timeout: 10_000});
	assert.match(sw.url(), /^chrome-extension:\/\/[a-p]{32}\/background\.js$/);
});
const id = sw.url().split('/')[2];
const popupURL = (q = '') => `chrome-extension://${id}/popup.html${q}`;

await step('manifest is MV3 with the omnibox keyword', async () => {
	const m = await sw.evaluate(() => chrome.runtime.getManifest());
	assert.equal(m.manifest_version, 3);
	assert.equal(m.name, 'Linkvite');
	assert.equal(m.omnibox?.keyword, 'lv');
});

const popup = await ctx.newPage();
await step('signed out: popup shows the sign-in form', async () => {
	await popup.goto(popupURL());
	await popup.getByLabel('Email or username').waitFor({timeout: 10_000});
	await popup.getByText('Create an account').waitFor();
});

await step('signs in with a password', async () => {
	await popup.getByLabel('Email or username').fill('kayode');
	await popup.getByLabel('Password').fill('correct horse');
	await popup.getByRole('button', {name: /sign in/i}).click();
	await popup
		.getByLabel('Email or username')
		.waitFor({state: 'detached', timeout: 10_000});
	assert.ok(calls.includes('POST /v1/auth/login'), 'login request sent');
});

const article = await ctx.newPage();
await article.goto(PAGE);
const tabId = await sw.evaluate(
	async (url) => (await chrome.tabs.query({url}))[0]?.id,
	PAGE,
);

const save = await ctx.newPage();
await step('saves a page (context-menu window)', async () => {
	assert.ok(tabId, 'found the article tab');
	await save.goto(popupURL(`?window=1&page=save&tabId=${tabId}`));
	await save.getByRole('button', {name: /^save$/i}).click({timeout: 10_000});
	await save.getByText('Saved to Linkvite.').waitFor({timeout: 10_000});
	assert.ok(calls.includes('POST /v1/bookmarks'), 'create request sent');
});

await step('"Open" opens the bookmark in a normal tab', async () => {
	const opened = ctx.waitForEvent('page', {
		predicate: (p) => p.url().includes('/bookmarks/bmk_1'),
		timeout: 10_000,
	});
	await save.getByRole('button', {name: /^open$/i}).click();
	await opened;
});

await ctx.close();

for (const [s, name] of results) console.log(`${s}  ${name}`);
const failed = results.filter(([s]) => s === 'FAIL').length;
console.log(`-- ${results.length - failed} passed, ${failed} failed`);
if (failed) {
	console.log('API calls:', calls.join(', '));
	process.exitCode = 1;
}
