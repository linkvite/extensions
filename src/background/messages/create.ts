import {
    handleCreateBookmark,
    type CreateBookmarkProps,
} from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging"

export type CreateMessageRequest = {
    data: CreateBookmarkProps;
}

export type CreateMessageResponse = { message: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
    CreateMessageRequest,
    CreateMessageResponse
> = async (req, res) => {
    try {
        await handleCreateBookmark({ ...req.body.data });
        return res.send({ message: "Bookmark created successfully" });
    } catch (error) {
        return res.send({ error });
    }
}

export default handler