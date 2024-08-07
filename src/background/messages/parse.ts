import type { ParsedLinkData } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleParseLink } from "~api";

export type ParseMessageRequest = {
	url: string;
};

export type ParseMessageResponse = {
	data?: ParsedLinkData;
	error?: string;
};

const handler: PlasmoMessaging.MessageHandler<
	ParseMessageRequest,
	ParseMessageResponse
> = async (req, res) => {
	try {
		const data = await handleParseLink({
			url: req.body.url,
		});

		return res.send({ data });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
