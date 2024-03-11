export const IS_DEV = process.env.NODE_ENV === "development";

export const APP_DOMAIN = "https://app.linkvite.io"
export const API_DOMAIN = "https://api.linkvite.io/v1";
export const WS_DOMAIN_PROD = "wss://api.linkvite.io/ws";
export const ASSETS_DOMAIN = "https://assets.linkvite.io";
export const FAVICON_URL = ASSETS_DOMAIN + "/cdn/favicon.webp";
export const SIGNUP_URL = `${APP_DOMAIN}/auth?modal=signup`;
export const FORGOT_PASSWORD_URL = `${APP_DOMAIN}/auth?modal=forgot-password`;