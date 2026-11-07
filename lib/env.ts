/**
 * Backend selection. Build with WXT_API_ENV=staging to target staging;
 * anything else is production.
 */
export const IS_STAGING = import.meta.env.WXT_API_ENV === 'staging';

export const API_BASE = IS_STAGING
	? 'https://api-stg.linkvite.io'
	: 'https://api.linkvite.io';
export const APP_URL = IS_STAGING
	? 'https://app-stg.linkvite.io'
	: 'https://app.linkvite.io';
/**
 * Sent with every API request. Background requests carry the browser's
 * User-Agent and not always an Origin, so this is how cultus tells the
 * extension's session apart from the web app's in Settings → Sessions.
 */
export const CLIENT_HEADERS = {'X-Linkvite-Client': 'extension'} as const;

// No staging Centrifugo yet: QR sign-in on staging needs one.
export const SOCKET_URL = 'wss://ws.linkvite.io/connection/websocket';

/**
 * OAuth client for "Continue with Linkvite" (public client, PKCE). Unset: the
 * button is hidden and people sign in with a password or QR code.
 */
export const OAUTH_CLIENT_ID: string =
	import.meta.env.WXT_OAUTH_CLIENT_ID ?? '';

/** Scopes the extension asks for with OAuth. */
export const OAUTH_SCOPES = [
	'user:read',
	'bookmarks:read',
	'bookmarks:write',
	'bookmarks:edit',
	'bookmarks:delete',
	'collections:read',
	'collections:write',
	'search:read',
].join(' ');

export const SIGNUP_URL = `${APP_URL}/auth/signup`;
export const FORGOT_PASSWORD_URL = `${APP_URL}/auth/forgot`;
