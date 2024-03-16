import { handleFindCollections } from "~api";
import type { Collection } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";

type FindCollectionsRequest = {
    query: string;
};

type FindCollectionsResponse = {
    data: Collection[];
} | { error: string };

const handler: PlasmoMessaging.MessageHandler<
    FindCollectionsRequest,
    FindCollectionsResponse
> = async (req, res) => {
    try {
        const data = await handleFindCollections({ query: req.body.query });
        return res.send({ data });
    } catch (error) {
        return res.send({ error });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler