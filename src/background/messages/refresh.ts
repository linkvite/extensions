import { api } from "~api";
import { API_DOMAIN } from "~utils";
import type { AuthResponse } from "~types";
import { persistAuthData } from "~utils/storage";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type RefreshRequest = {
    token: string;
}

export type RefreshResponse = { token: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
    RefreshRequest,
    RefreshResponse
> = async (req, res) => {
    try {
        const resp = await api
            .post(`${API_DOMAIN}/auth/token/refresh`, {
                refreshToken: req.body.token
            });

        const data = resp.data.data as AuthResponse;
        await persistAuthData(data);

        return res.send({ token: data.accessToken });
    } catch (error) {
        return res.send({ error: String(error) });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler