/**
 * Sign-in and token refresh. Runs only in the background worker: the popup
 * and options page ask it for tokens over messaging (lib/messages.ts), so
 * there is never more than one refresh in flight. Linkvite's refresh tokens
 * are single-use, and replaying one revokes the whole session.
 */
import {LinkviteError, login, oauth, refreshSession} from '@linkvite/js';
import {API_BASE, CLIENT_HEADERS, OAUTH_CLIENT_ID, OAUTH_SCOPES} from './env';
import {type Session, sessionItem} from './storage';

export async function currentSession(): Promise<Session | null> {
	return sessionItem.getValue();
}

export async function accessToken(): Promise<string | null> {
	return (await currentSession())?.accessToken ?? null;
}

let inflight: Promise<string | null> | null = null;

/** A fresh access token, or null (signed out). Concurrent callers share one refresh. */
export function refresh(): Promise<string | null> {
	inflight ??= (async () => {
		try {
			const s = await currentSession();
			if (!s) return null;
			if (s.kind === 'oauth') {
				const t = await oauth.refresh(
					{clientId: OAUTH_CLIENT_ID, refreshToken: s.refreshToken},
					{baseUrl: API_BASE},
				);
				await sessionItem.setValue({
					...s,
					accessToken: t.access_token,
					refreshToken: t.refresh_token,
				});
				return t.access_token;
			}
			const r = await refreshSession(s.refreshToken, {
				baseUrl: API_BASE,
				headers: {...CLIENT_HEADERS},
			});
			await sessionItem.setValue({
				...s,
				user: r.user ?? s.user,
				accessToken: r.access_token,
				refreshToken: r.refresh_token,
			});
			return r.access_token;
		} catch (err) {
			// a rejected refresh token (expired, revoked, reused) means signing in again
			if (
				err instanceof LinkviteError &&
				(err.status === 400 || err.status === 401)
			) {
				await sessionItem.setValue(null);
				return null;
			}
			throw err;
		} finally {
			inflight = null;
		}
	})();
	return inflight;
}

export async function signInWithPassword(
	identifier: string,
	password: string,
): Promise<Session> {
	const r = await login(identifier, password, {
		baseUrl: API_BASE,
		headers: {...CLIENT_HEADERS},
	});
	if (!r.user) throw new Error('Sign-in returned no user');
	return saveSession({
		kind: 'session',
		user: r.user,
		accessToken: r.access_token,
		refreshToken: r.refresh_token,
	});
}

/** QR sign-in: the phone sends the user and a token pair over the socket. */
export async function completeSession(
	user: Session['user'],
	accessToken: string,
	refreshToken: string,
) {
	return saveSession({kind: 'session', user, accessToken, refreshToken});
}

/** "Continue with Linkvite": authorization code + PKCE through the browser's identity API. */
export async function signInWithOAuth(): Promise<Session> {
	if (!OAUTH_CLIENT_ID || !browser.identity?.launchWebAuthFlow) {
		throw new Error('OAuth sign-in is not available in this browser');
	}
	const redirectUri = browser.identity.getRedirectURL();
	const pkce = await oauth.createPkce();
	const state = await oauth.createState();
	const url = oauth.authorizeUrl(
		{
			clientId: OAUTH_CLIENT_ID,
			redirectUri,
			scope: OAUTH_SCOPES,
			state,
			codeChallenge: pkce.challenge,
		},
		{baseUrl: API_BASE},
	);
	const back = await browser.identity.launchWebAuthFlow({
		url,
		interactive: true,
	});
	if (!back) throw new Error('Sign-in was cancelled');
	const params = new URL(back).searchParams;
	if (params.get('error'))
		throw new Error(
			params.get('error_description') ??
				params.get('error') ??
				'Sign-in failed',
		);
	if (params.get('state') !== state)
		throw new Error('Sign-in failed (state mismatch)');
	const code = params.get('code');
	if (!code) throw new Error('Sign-in returned no code');
	const t = await oauth.exchangeCode(
		{clientId: OAUTH_CLIENT_ID, redirectUri, code, codeVerifier: pkce.verifier},
		{baseUrl: API_BASE},
	);
	const user = await fetchUser(t.access_token);
	return saveSession({
		kind: 'oauth',
		user,
		accessToken: t.access_token,
		refreshToken: t.refresh_token,
	});
}

export async function signOut(): Promise<void> {
	const s = await currentSession();
	await sessionItem.setValue(null);
	if (!s) return;
	try {
		if (s.kind === 'oauth') {
			await oauth.revoke(
				{clientId: OAUTH_CLIENT_ID, token: s.refreshToken},
				{baseUrl: API_BASE},
			);
		} else {
			await fetch(`${API_BASE}/v1/auth/logout`, {
				method: 'POST',
				headers: {
					...CLIENT_HEADERS,
					'Content-Type': 'application/json',
					Authorization: `Bearer ${s.accessToken}`,
				},
				body: JSON.stringify({refresh_token: s.refreshToken}),
			});
		}
	} catch {
		// signed out locally either way
	}
}

async function fetchUser(token: string): Promise<Session['user']> {
	const res = await fetch(`${API_BASE}/v1/user`, {
		headers: {
			...CLIENT_HEADERS,
			Authorization: `Bearer ${token}`,
			Accept: 'application/json',
		},
	});
	const json = (await res.json()) as {
		ok: boolean;
		data?: Session['user'];
		error?: string;
	};
	if (!res.ok || !json.data)
		throw new Error(json.error ?? 'Could not load your account');
	return json.data;
}

async function saveSession(s: Session): Promise<Session> {
	await sessionItem.setValue(s);
	return s;
}
