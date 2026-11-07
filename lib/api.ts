import {Linkvite} from '@linkvite/js';
import {accessToken, refresh} from './auth';
import {API_BASE, CLIENT_HEADERS} from './env';
import {send} from './messages';

/** API client for the popup and options pages: tokens come from the background. */
export function pageClient(): Linkvite {
	return new Linkvite({
		baseUrl: API_BASE,
		headers: {...CLIENT_HEADERS},
		token: () => send({type: 'auth:token'}),
		onUnauthorized: () => send({type: 'auth:refresh'}),
	});
}

/** API client for the background worker itself. */
export function backgroundClient(): Linkvite {
	return new Linkvite({
		baseUrl: API_BASE,
		headers: {...CLIENT_HEADERS},
		token: accessToken,
		onUnauthorized: refresh,
	});
}
