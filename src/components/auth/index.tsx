import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { browser } from "~browser";
import { FORGOT_PASSWORD_URL, SIGNUP_URL } from "~utils";
import { Logo } from "~components/header";
import { RootProvider } from "~components/wrapper";
import { sendToBackground } from "@plasmohq/messaging";
import type {
	AuthMessageRequest,
	AuthMessageResponse,
} from "~background/messages/auth";
import { AppText } from "~components/text";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import {
	AuthContainer,
	AuthDescription,
	AuthErrorText,
	AuthInputContainer,
	AuthInputField,
	AuthInputLabel,
	AuthMethodContainer,
	AuthPasswordIcon,
	AuthSignUpContainer,
	AuthSignUpText,
	AuthSubmitButton,
	AuthTitle,
} from "./styles";
import { Spinner } from "~components/spinner";
import { AuthWithQR } from "./qrAuth";
import type { OnLogin } from "~components/wrapper/auth";

export function Login({ onLogin }: { onLogin: OnLogin }) {
	const [view, setView] = useState<"login" | "qr">("login");
	const Element = view === "login" ? AuthWithCreds : AuthWithQR;

	function toggleView() {
		setView(view === "login" ? "qr" : "login");
	}

	return (
		<RootProvider $isAuth>
			<Logo />
			<Element onLogin={onLogin} />

			<AuthMethodContainer>
				{view === "login" ? (
					<AuthSignUpContainer>
						<AuthSignUpText
							type="button"
							$second
							onClick={toggleView}
							style={{ textDecoration: "underline" }}
						>
							Got the app already? Use QR code
						</AuthSignUpText>
					</AuthSignUpContainer>
				) : (
					<AuthSignUpContainer style={{ marginTop: 15 }}>
						<AuthSignUpText
							type="button"
							$second
							onClick={toggleView}
							style={{ textDecoration: "underline" }}
						>
							Log in with email instead
						</AuthSignUpText>
					</AuthSignUpContainer>
				)}
			</AuthMethodContainer>
		</RootProvider>
	);
}

function AuthWithCreds({ onLogin }: { onLogin: OnLogin }) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [identifier, setIdentifier] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false);
	const togglePassword = () => setPasswordVisible(!passwordVisible);

	function handleInput(evt: ChangeEvent<HTMLInputElement>) {
		setError(null);

		if (evt.target.name === "identifier") {
			{
				setIdentifier(evt.target.value);
			}
		}

		if (evt.target.name === "password") {
			{
				setPassword(evt.target.value);
			}
		}
	}

	function clear() {
		setError(null);
		setPassword("");
		setIdentifier("");
	}

	async function handleSubmit(evt: SyntheticEvent) {
		evt.preventDefault();
		setIsLoading(true);

		if (!identifier || !password) {
			setError("Please fill out all fields");
			setIsLoading(false);
			return;
		}

		const onComplete = () => setIsLoading(false);
		const onError = (err: string) => setError(err);
		const resp = await sendToBackground<
			AuthMessageRequest,
			AuthMessageResponse
		>({
			name: "auth",
			body: {
				identifier: identifier,
				password: password,
			},
		}).finally(onComplete);

		if ("error" in resp) {
			onError(resp.error);
			return;
		}

		clear();
		onLogin(resp.user, resp.token);
	}

	function onClickSignUpButton() {
		browser.tabs.create({ url: SIGNUP_URL, active: true });
	}

	function onClickForgotPassword() {
		browser.tabs.create({ url: FORGOT_PASSWORD_URL, active: true });
	}

	return (
		<AuthContainer id="login" onSubmit={handleSubmit}>
			<AuthTitle fontSize="sm" fontWeight="bold">
				Welcome back
			</AuthTitle>

			<AuthDescription isSubText>
				Sign in to your account to continue.
			</AuthDescription>

			{error ? <AuthErrorText textAlign="center">{error}</AuthErrorText> : null}

			<AuthInputContainer $first style={{ marginTop: 30 }}>
				<AuthInputLabel htmlFor="identifier">
					<span>Identifier</span>
				</AuthInputLabel>
				<AuthInputField
					required
					type="text"
					id="identifier"
					name="identifier"
					value={identifier}
					$hasError={!!error}
					placeholder="john_doe"
					onChange={handleInput}
				/>
			</AuthInputContainer>

			<AuthInputContainer style={{ position: "relative" }}>
				<AuthInputLabel $second htmlFor="password">
					<span>Password</span>
				</AuthInputLabel>
				<AuthInputField
					required
					id="password"
					name="password"
					value={password}
					$hasError={!!error}
					placeholder="••••••••••••"
					type={passwordVisible ? "text" : "password"}
					onChange={handleInput}
				/>
				<AuthPasswordIcon>
					{passwordVisible ? (
						<BsEyeFill onClick={togglePassword} />
					) : (
						<BsEyeSlashFill onClick={togglePassword} />
					)}
				</AuthPasswordIcon>
			</AuthInputContainer>

			<AuthSignUpContainer style={{ marginBottom: 0 }}>
				<AuthSignUpText
					$second
					type="button"
					style={{ margin: 0 }}
					onClick={onClickForgotPassword}
				>
					Forgot password?
				</AuthSignUpText>
			</AuthSignUpContainer>

			<AuthSubmitButton
				type="submit"
				disabled={isLoading}
				onClick={handleSubmit}
				onSubmit={handleSubmit}
			>
				{isLoading ? (
					<Spinner />
				) : (
					<AppText color="light" fontWeight="bold">
						Login
					</AppText>
				)}
			</AuthSubmitButton>

			<AuthSignUpContainer>
				<AuthSignUpText type="button">
					Don&apos;t have an account?
				</AuthSignUpText>

				<AuthSignUpText type="button" $second onClick={onClickSignUpButton}>
					Sign up
				</AuthSignUpText>
			</AuthSignUpContainer>
		</AuthContainer>
	);
}
