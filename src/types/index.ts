import type { User } from "@linkvite/js";
import { XiorError, type XiorResponse } from "xior";

export type Theme = "light" | "dark" | "system";

type HTTPError = {
    ok: boolean;
    error: string;
    errors?: unknown[];
}

export class HTTPException<T = HTTPError> extends XiorError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message: string, request: any, response: XiorResponse<T>) {
        super(message, request, response);
    }
}

export type AuthResponse = {
    user: User;
    accessToken: string;
    refreshToken: string;
}
