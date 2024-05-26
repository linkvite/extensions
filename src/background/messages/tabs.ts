import { handleCreateTabBookmarks, type CreateTabBookmarkProps } from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging";

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
