import { handleUpdateBookmark } from "~api";
import type { Bookmark } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type UpdateMessageRequest = {
    bookmark: Bookmark;
}

export type UpdateMessageResponse = { message: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
    UpdateMessageRequest,
    UpdateMessageResponse
> = async (req, res) => {
    try {
        await handleUpdateBookmark({
            bookmark: req.body.bookmark
        });
        return res.send({ message: "Bookmark updated successfully" });
    } catch (error) {
        return res.send({ error });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler