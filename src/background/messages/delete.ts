import { api } from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type DeleteMessageRequest = {
    id: string;
}

export type DeleteMessageResponse = { message: string } | { error: string }

const handler: PlasmoMessaging.MessageHandler<
    DeleteMessageRequest,
    DeleteMessageResponse
> = async (req, res) => {
    const endpoint = `/bookmarks/${req.body.id}`;
    const body = { status: "trashed" };

    try {
        await api.patch(endpoint, body);
        return res.send({ message: "Bookmark deleted successfully" });
    } catch (error) {
        return res.send({ error: String(error) });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler