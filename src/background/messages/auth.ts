import { handleAuthentication } from "~api";
import { persistAuthData } from "~utils/storage";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { User } from "@linkvite/js";

export type AuthMessageRequest = {
    password: string;
    identifier: string;
}

type SuccessResponse = {
    user: User;
    token: string;
}

type ErrorResponse = {
    error: string;
}

export type AuthMessageResponse = SuccessResponse | ErrorResponse;

const handler: PlasmoMessaging.MessageHandler<
    AuthMessageRequest,
    AuthMessageResponse
> = async (req, res) => {
    try {
        const resp = await handleAuthentication({
            body: req.body
        });

        await persistAuthData(resp);

        return res.send({ user: resp.user, token: resp.refreshToken });
    } catch (error) {
        return res.send({ error })
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler