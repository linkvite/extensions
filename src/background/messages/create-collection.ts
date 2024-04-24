import { handleCreateCollection } from "~api";
import type { Collection } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type CreateCollectionRequest = {
    name: string
};

export type CreateCollectionResponse = {
    data: Collection
} | {
    error: string
};

const handler: PlasmoMessaging.MessageHandler<
    CreateCollectionRequest,
    CreateCollectionResponse
> = async (req, res) => {
    try {
        const data = await handleCreateCollection({
            name: req.body.name
        });
        return res.send({ data });
    } catch (error) {
        return res.send({ error: String(error) });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler