import { handleCreateFile, type FileBookmarkProps } from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type CreateFileMessageRequest = {
	data: FileBookmarkProps;
};

export type CreateFileMessageResponse = { message: string } | { error: string };

const handler: PlasmoMessaging.MessageHandler<
	CreateFileMessageRequest,
	CreateFileMessageResponse
> = async (req, res) => {
	try {
		await handleCreateFile({ ...req.body.data });
		return res.send({ message: "Bookmark created successfully" });
	} catch (error) {
		console.error("Failed to create bookmark.", error);
		return res.send({ error: String(error) });
	}
};

export default handler;
