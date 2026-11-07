/**
 * Typed messages from the popup/options pages to the background worker, which
 * owns the tokens (lib/auth.ts).
 */
import type {Session} from './storage';

export type Request =
	| {type: 'auth:token'}
	| {type: 'auth:refresh'}
	| {type: 'auth:password'; identifier: string; password: string}
	| {type: 'auth:oauth'}
	| {
			type: 'auth:complete';
			user: Session['user'];
			accessToken: string;
			refreshToken: string;
	  }
	| {type: 'auth:signout'};

type Responses = {
	'auth:token': string | null;
	'auth:refresh': string | null;
	'auth:password': Session;
	'auth:oauth': Session;
	'auth:complete': Session;
	'auth:signout': null;
};

type Envelope<T> = {ok: true; value: T} | {ok: false; error: string};

export async function send<R extends Request>(
	req: R,
): Promise<Responses[R['type']]> {
	const res = (await browser.runtime.sendMessage(req)) as
		| Envelope<Responses[R['type']]>
		| undefined;
	if (!res) throw new Error('The extension background is not responding');
	if (!res.ok) throw new Error(res.error);
	return res.value;
}

export type Handler = {
	[K in Request['type']]: (
		req: Extract<Request, {type: K}>,
	) => Promise<Responses[K]>;
};

/** Wire handlers into runtime.onMessage (background). */
export function listen(handlers: Handler) {
	browser.runtime.onMessage.addListener((msg: unknown) => {
		const req = msg as Request;
		const h = handlers[req?.type] as
			| ((r: Request) => Promise<unknown>)
			| undefined;
		if (!h) return undefined;
		return h(req).then(
			(value) => ({ok: true, value}),
			(err: unknown) => ({
				ok: false,
				error: err instanceof Error ? err.message : String(err),
			}),
		);
	});
}
