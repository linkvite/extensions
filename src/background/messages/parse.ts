import { handleParseLink } from "~api";
import type { ParsedLinkData } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type ParseMessageRequest = {
    url: string;
}

export type ParseMessageResponse = {
    data?: ParsedLinkData;
    error?: string;
}

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
}

// eslint-disable-next-line import/no-unused-modules
export default handler