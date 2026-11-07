# Linkvite browser extension

Save and organize bookmarks without leaving the page. Built with [WXT](https://wxt.dev), React 19 and Tailwind, on [`@linkvite/js`](https://github.com/linkvite/js). One codebase for Chrome (and other Chromium browsers: Edge, Brave, Arc, Opera), Firefox and Safari, all Manifest V3.

## What it does

- **Popup**: save the current page with its title, description, cover, tags, star and collection. Pages you've already saved open in edit mode (update, delete, open in Linkvite).
- **Page details**: read from the page itself (works behind logins) or fetched by Linkvite.
- **Context menus**: save the page, a link, or an image (uploaded as a file); from the toolbar icon: save all tabs, options, open Linkvite.
- **Save all tabs**: pick which open tabs to save, into one collection. Asks for the optional `tabs` permission first.
- **Address bar**: type `lv` and a space to search your bookmarks.
- **Shortcut**: <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> opens the popup.
- **Options**: default collection, save when the popup opens, close after saving, page details source, theme, sign out.
- **Sign in**: email or username and password, a QR code scanned with the mobile app, or "Continue with Linkvite" (OAuth with PKCE) where the browser supports it and a client ID is configured.

## Develop

```bash
pnpm install
pnpm dev              # Chrome, with hot reload
pnpm dev:firefox
```

The SDK comes from `../js` (a pnpm override) until `@linkvite/js` v4 is on npm. `pnpm dev`/`build` build it there first if needed (`scripts/ensure-sdk.mjs`); after changing the SDK, rebuild it with `pnpm sdk:build`. Once v4 is published, remove the override, `scripts/ensure-sdk.mjs` and its calls in `package.json`.

## Build

```bash
pnpm build            # .output/chrome-mv3
pnpm build:firefox    # .output/firefox-mv3
pnpm build:safari     # .output/safari-mv3, then convert with:
xcrun safari-web-extension-converter .output/safari-mv3
pnpm zip              # store-ready zip (pnpm zip:firefox for AMO)
```

| Variable | |
| --- | --- |
| `WXT_API_ENV=staging` | Use the staging API and web app (`pnpm build:staging`) |
| `WXT_OAUTH_CLIENT_ID` | Enables "Continue with Linkvite". Register a **public** OAuth app whose redirect URIs include the browser's identity URL: `https://<extension-id>.chromiumapp.org/` for Chrome, and the URL `browser.identity.getRedirectURL()` returns in Firefox. Safari has no identity API, so it always uses password and QR sign-in. |

## How it's put together

| Path | |
| --- | --- |
| `entrypoints/background.ts` | Context menus, omnibox, and the only place tokens are refreshed |
| `entrypoints/popup`, `entrypoints/options` | The UI (`components/app.tsx` picks the page from `?page=`) |
| `lib/auth.ts` | Sign-in, single-flight refresh, sign-out |
| `lib/messages.ts` | Typed messages from the UI to the background |
| `lib/page.ts` | Reads a tab's title, description, image and icon |

Refresh tokens are single-use, and reusing one signs the session out, so the popup and options page never refresh themselves: they ask the background worker, which runs one refresh at a time.

```bash
pnpm typecheck && pnpm lint
```
