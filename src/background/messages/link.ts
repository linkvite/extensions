import { handleCreateLinkBookmark } from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging"

export type CreateBookmarkRequest = {
    url: string;
    collection?: string;
}

export type CreateBookmarkResponse = { message: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
    CreateBookmarkRequest,
    CreateBookmarkResponse
> = async (req, res) => {
    try {
        await handleCreateLinkBookmark({ ...req.body });
        return res.send({ message: "Bookmark created successfully" });
    } catch (error) {
        return res.send({ error: String(error) });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler