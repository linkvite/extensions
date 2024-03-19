import { handleFindCollection } from "~api";
import type { Collection } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type FindCollectionRequest = {
    id: string
};

export type FindCollectionResponse = {
    data: Collection
} | {
    error: string
};

const handler: PlasmoMessaging.MessageHandler<
    FindCollectionRequest,
    FindCollectionResponse
> = async (req, res) => {
    try {
        const data = await handleFindCollection({
            id: req.body.id
        });
        return res.send({ data });
    } catch (error) {
        return res.send({ error: String(error) });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler