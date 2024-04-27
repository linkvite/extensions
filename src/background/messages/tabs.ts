import {
    handleCreateTabBookmarks,
    type CreateTabBookmarkProps,
} from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type TabsMessageResponse = { message: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
    CreateTabBookmarkProps,
    TabsMessageResponse
> = async (req, res) => {
    try {
        await handleCreateTabBookmarks({ ...req.body });
        return res.send({ message: "Bookmark created successfully" });
    } catch (error) {
        return res.send({ error: String(error) });
    }
}

// eslint-disable-next-line import/no-unused-modules
export default handler