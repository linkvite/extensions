import type { User } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleAuthentication } from "~api";
import { persistAuthData } from "~utils/storage";

export type AuthMessageRequest = {
	password: string;
	identifier: string;
};

type SuccessResponse = {
	user: User;
	token: string;
};

type ErrorResponse = {
	error: string;
};

export type AuthMessageResponse = SuccessResponse | ErrorResponse;

const handler: PlasmoMessaging.MessageHandler<
	AuthMessageRequest,
	AuthMessageResponse
> = async (req, res) => {
	try {
		const resp = await handleAuthentication({
			body: req.body,
		});

		await persistAuthData(resp);

		return res.send({ user: resp.user, token: resp.refreshToken });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
