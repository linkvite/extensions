import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleAuthentication } from "~api";
import type { AuthResponse } from "~types";
import { persistAuthData } from "~utils/storage";

export type AuthMessageRequest = {
	password: string;
	identifier: string;
};

type ErrorResponse = {
	error: string;
};

export type AuthMessageResponse = AuthResponse | ErrorResponse;

const handler: PlasmoMessaging.MessageHandler<
	AuthMessageRequest,
	AuthMessageResponse
> = async (req, res) => {
	try {
		const resp = await handleAuthentication({
			body: req.body,
		});
		await persistAuthData(resp);
		return res.send(resp);
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
