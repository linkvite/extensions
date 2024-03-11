import type { User } from "@linkvite/js";
import { handleAuthentication } from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging"

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
    await handleAuthentication({
        body: req.body,
        onLogin: (user, token) => {
            return res.send({
                user,
                token
            });
        },
        onError: (err: string) => {
            return res.send({ error: err });
        }
    })

    res.send({
        error: "An unknown error occurred"
    })
}

export default handler