import type { User } from "@linkvite/js";
import { XiorError, type XiorResponse } from "xior";

export type Theme = "light" | "dark" | "system";

type HTTPError = {
	ok: boolean;
	error: string;
	errors?: unknown[];
};

export class HTTPException<T = HTTPError> extends XiorError {
	constructor(message: string, request: unknown, response: XiorResponse<T>) {
		super(message, request, response);
	}
}

export type AuthResponse = {
	user: User;
	access_token: string;
	refresh_token: string;
};
