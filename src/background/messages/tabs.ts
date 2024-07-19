import type { PlasmoMessaging } from "@plasmohq/messaging";
import { type CreateTabBookmarkProps, handleCreateTabBookmarks } from "~api";

export type TabsMessageResponse = { message: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
	CreateTabBookmarkProps,
	TabsMessageResponse
> = async (req, res) => {
	try {
		const message = await handleCreateTabBookmarks({ ...req.body });
		return res.send({ message });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
