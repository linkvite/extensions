import type { Bookmark } from "@linkvite/js";
import { handleUpdateBookmarkCover } from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type UpdateCoverMessageRequest = {
	id: string;
	cover: string;
	type: "default" | "custom";
};

export type UpdateCoverMessageResponse =
	| { bookmark: Bookmark }
	| { error: string };

const handler: PlasmoMessaging.MessageHandler<
	UpdateCoverMessageRequest,
	UpdateCoverMessageResponse
> = async (req, res) => {
	try {
		const bookmark = await handleUpdateBookmarkCover({
			id: req.body.id,
			cover: req.body.cover,
			type: req.body.type,
		});
		return res.send({ bookmark });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
