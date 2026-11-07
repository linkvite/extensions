import {
	API_BASE,
	CLIENT_HEADERS,
	FORGOT_PASSWORD_URL,
	OAUTH_CLIENT_ID,
	SIGNUP_URL,
	SOCKET_URL,
} from '@/lib/env';
import {send} from '@/lib/messages';
import type {Session} from '@/lib/storage';
import {Centrifuge} from 'centrifuge';
import {QrCode, RefreshCw} from 'lucide-react';
import {QRCodeSVG} from 'qrcode.react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {errorMessage} from './hooks';
import {Button, Field, Input, Spinner, TabLink, cn} from './ui';

const oauthAvailable =
	!!OAUTH_CLIENT_ID && !!browser.identity?.launchWebAuthFlow;

export function SignIn() {
	const [mode, setMode] = useState<'password' | 'qr'>('password');
	return (
		<div className="flex flex-col gap-4 p-5">
			<div className="flex flex-col items-center gap-2 pt-2 text-center">
				<img src="/icon/96.png" alt="" className="size-10 rounded-xl" />
				<h1 className="text-base font-semibold">Sign in to Linkvite</h1>
			</div>

			{oauthAvailable ? <OAuthButton /> : null}

			<div
				className="flex rounded-lg border border-line p-0.5 text-xs"
				role="tablist"
			>
				{(['password', 'qr'] as const).map((m) => (
					<button
						key={m}
						type="button"
						role="tab"
						aria-selected={mode === m}
						onClick={() => setMode(m)}
						className={cn(
							'flex-1 rounded-md py-1.5',
							mode === m ? 'bg-surface text-foreground' : 'text-muted',
						)}
					>
						{m === 'password' ? 'Email or username' : 'QR code'}
					</button>
				))}
			</div>

			{mode === 'password' ? <PasswordForm /> : <QRSignIn />}

			<p className="text-center text-xs text-muted">
				New to Linkvite?{' '}
				<TabLink href={SIGNUP_URL} className="text-coral hover:underline">
					Create an account
				</TabLink>
			</p>
		</div>
	);
}

function OAuthButton() {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	return (
		<div className="flex flex-col gap-1.5">
			<Button
				loading={busy}
				onClick={async () => {
					setBusy(true);
					setError('');
					try {
						await send({type: 'auth:oauth'});
					} catch (err) {
						setError(errorMessage(err));
					} finally {
						setBusy(false);
					}
				}}
			>
				Continue with Linkvite
			</Button>
			{error ? <p className="text-xs text-red-400">{error}</p> : null}
		</div>
	);
}

function PasswordForm() {
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	return (
		<form
			className="flex flex-col gap-3"
			onSubmit={async (e) => {
				e.preventDefault();
				setBusy(true);
				setError('');
				try {
					await send({
						type: 'auth:password',
						identifier: identifier.trim(),
						password,
					});
				} catch (err) {
					setError(errorMessage(err));
				} finally {
					setBusy(false);
				}
			}}
		>
			<Field label="Email or username">
				<Input
					autoFocus
					autoComplete="username"
					value={identifier}
					onChange={(e) => setIdentifier(e.target.value)}
					required
				/>
			</Field>
			<Field
				label="Password"
				hint={
					<TabLink href={FORGOT_PASSWORD_URL} className="hover:underline">
						Forgot your password?
					</TabLink>
				}
			>
				<Input
					type="password"
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={6}
				/>
			</Field>
			{error ? <p className="text-xs text-red-400">{error}</p> : null}
			<Button
				type="submit"
				variant={oauthAvailable ? 'outline' : 'primary'}
				loading={busy}
				disabled={!identifier || !password}
			>
				Sign in
			</Button>
		</form>
	);
}

type QRState =
	| {kind: 'loading'}
	| {kind: 'ready'; endpoint: string}
	| {
			kind: 'scanned';
			endpoint: string;
			owner: {name: string; username: string; avatar: string};
	  }
	| {kind: 'error'; message: string};

type QREvent = {event?: string; data?: Record<string, unknown>};

// Code validity (5 min) minus slack; then a fresh one.
const QR_TTL_MS = 5 * 60_000 - 10_000;

/**
 * Sign in by scanning a QR code with the Linkvite mobile app.
 * POST /v1/qr-auth/new returns {endpoint, token}: the QR encodes `endpoint`,
 * and `token` connects to Centrifugo, which delivers the session's events
 * (scanned, accepted with the user and tokens, closed or rejected).
 */
function QRSignIn() {
	const [state, setState] = useState<QRState>({kind: 'loading'});
	const ws = useRef<Centrifuge | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const stop = useCallback(() => {
		clearTimeout(timer.current);
		ws.current?.disconnect();
		ws.current = null;
	}, []);

	const start = useCallback(async () => {
		stop();
		setState({kind: 'loading'});
		try {
			const res = await fetch(`${API_BASE}/v1/qr-auth/new`, {
				method: 'POST',
				headers: {
					...CLIENT_HEADERS,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: '{}',
			});
			const json = (await res.json()) as {
				data?: {endpoint?: string; token?: string};
				error?: string;
			};
			const {endpoint, token} = json.data ?? {};
			if (!res.ok || !endpoint || !token)
				throw new Error(json.error ?? "Couldn't start a QR session");
			const c = new Centrifuge(SOCKET_URL, {token});
			c.on('publication', async (ctx) => {
				const p = ctx.data as QREvent | undefined;
				switch (p?.event) {
					case 'qr:session:validated':
						setState({
							kind: 'scanned',
							endpoint,
							owner: {
								name: String(p.data?.name ?? ''),
								username: String(p.data?.username ?? ''),
								avatar: String(p.data?.avatar ?? ''),
							},
						});
						break;
					case 'qr:session:accepted': {
						const d = p.data as
							| {
									user?: Session['user'];
									access_token?: string;
									refresh_token?: string;
							  }
							| undefined;
						stop();
						if (!d?.user || !d.access_token || !d.refresh_token) {
							setState({
								kind: 'error',
								message: 'The app sent an incomplete sign-in.',
							});
							return;
						}
						await send({
							type: 'auth:complete',
							user: d.user,
							accessToken: d.access_token,
							refreshToken: d.refresh_token,
						});
						break;
					}
					case 'qr:session:closed':
					case 'qr:session:rejected':
						void start();
						break;
				}
			});
			c.connect();
			ws.current = c;
			setState({kind: 'ready', endpoint});
			timer.current = setTimeout(() => void start(), QR_TTL_MS);
		} catch (err) {
			setState({kind: 'error', message: errorMessage(err)});
		}
	}, [stop]);

	useEffect(() => {
		void start();
		return stop;
	}, [start, stop]);

	if (state.kind === 'loading') {
		return (
			<div className="grid h-64 place-items-center">
				<Spinner />
			</div>
		);
	}
	if (state.kind === 'error') {
		return (
			<div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
				<p className="text-sm text-muted">{state.message}</p>
				<Button variant="outline" size="sm" onClick={() => void start()}>
					<RefreshCw className="size-3.5" /> Try again
				</Button>
			</div>
		);
	}
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="relative rounded-xl bg-white p-3">
				<QRCodeSVG
					value={state.endpoint}
					size={200}
					className={cn(state.kind === 'scanned' && 'opacity-10 blur-[2px]')}
				/>
				{state.kind === 'scanned' ? (
					<div className="absolute inset-0 grid place-items-center p-4 text-neutral-900">
						<div className="flex flex-col items-center gap-2">
							<Avatar owner={state.owner} />
							<p className="max-w-[180px] truncate text-sm font-medium">
								{state.owner.name || `@${state.owner.username}`}
							</p>
						</div>
					</div>
				) : null}
			</div>
			{state.kind === 'scanned' ? (
				<p className="text-center text-sm">Confirm on your phone.</p>
			) : (
				<p className="flex items-center gap-1.5 text-center text-xs text-muted">
					<QrCode className="size-3.5" /> Scan with the Linkvite app on your
					phone. The code expires in 5 minutes.
				</p>
			)}
		</div>
	);
}

/** The scanning account's picture, or its initial when it has none or it fails to load. */
function Avatar({
	owner,
}: {owner: {name: string; username: string; avatar: string}}) {
	const [failed, setFailed] = useState(false);
	if (owner.avatar && !failed) {
		return (
			<img
				src={owner.avatar}
				alt=""
				onError={() => setFailed(true)}
				className="size-14 rounded-full object-cover"
			/>
		);
	}
	return (
		<span className="grid size-14 place-items-center rounded-full bg-coral text-lg font-semibold text-white">
			{(owner.name || owner.username || '?').charAt(0).toUpperCase()}
		</span>
	);
}
