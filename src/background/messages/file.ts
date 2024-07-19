import type { PlasmoMessaging } from "@plasmohq/messaging";
import { type FileBookmarkProps, handleCreateFile } from "~api";

export type CreateFileMessageRequest = {
	data: FileBookmarkProps;
};

export type CreateFileMessageResponse = { message: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
	CreateFileMessageRequest,
	CreateFileMessageResponse
> = async (req, res) => {
	try {
		const message = await handleCreateFile({ ...req.body.data });
		return res.send({ message });
	} catch (error) {
		console.error("Failed to create bookmark.", error);
		return res.send({ error: String(error) });
	}
};

export default handler;
