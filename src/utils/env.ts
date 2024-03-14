export const IS_DEV = process.env.NODE_ENV === "development";

export const APP_DOMAIN = "https://app.linkvite.io"
export const API_DOMAIN = "https://95ec-2603-900a-1d3f-ff3a-5994-46dc-9a4f-fe46.ngrok-free.app/v1";
// export const API_DOMAIN = "https://api.linkvite.io/v1";
export const WS_DOMAIN_PROD = "wss://api.linkvite.io/ws";
export const ASSETS_DOMAIN = "https://assets.linkvite.io";
export const COVER_URL = ASSETS_DOMAIN + "/covers/default.png";
export const FAVICON_URL = ASSETS_DOMAIN + "/cdn/favicon.webp";
export const SIGNUP_URL = `${APP_DOMAIN}/auth?modal=signup`;
export const FORGOT_PASSWORD_URL = `${APP_DOMAIN}/auth?modal=forgot-password`;