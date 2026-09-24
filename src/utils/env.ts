/**
 * Backend selection. Build with PLASMO_PUBLIC_API_ENV=staging (e.g. in
 * .env.staging, `plasmo build --env=.env.staging`) to point the extension at
 * staging; anything else targets production.
 */
const IS_STAGING = process.env.PLASMO_PUBLIC_API_ENV === "staging";

export const APP_DOMAIN = IS_STAGING
	? "https://app-stg.linkvite.io"
	: "https://app.linkvite.io";
export const API_DOMAIN = IS_STAGING
	? "https://api-stg.linkvite.io/v1"
	: "https://api.linkvite.io/v1";
// No staging Centrifugo yet: QR login on staging needs one.
export const WS_ENDPOINT = "wss://ws.linkvite.io/connection/websocket";
const ASSETS_DOMAIN = "https://assets.linkvite.io";
export const QR_LOGO_URL = ASSETS_DOMAIN + "/cdn/QRLogo";
export const COVER_URL = ASSETS_DOMAIN + "/covers/default.png";
export const FAVICON_URL = ASSETS_DOMAIN + "/cdn/favicon.webp";
export const SIGNUP_URL = `${APP_DOMAIN}/auth?modal=signup`;
export const FORGOT_PASSWORD_URL = `${APP_DOMAIN}/auth?modal=forgot-password`;
