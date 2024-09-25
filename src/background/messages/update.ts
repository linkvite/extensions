import type { Bookmark } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleUpdateBookmark } from "~api";

export type UpdateMessageRequest = {
	bookmark: Bookmark;
};

export type UpdateMessageResponse =
	| {
			message: string;
			bookmark: Bookmark;
	  }
	| { error: string };

const handler: PlasmoMessaging.MessageHandler<
	UpdateMessageRequest,
	UpdateMessageResponse
> = async (req, res) => {
	try {
		const bookmark = await handleUpdateBookmark({
			bookmark: req.body.bookmark,
		});
		return res.send({
			bookmark: bookmark,
			message: "Bookmark updated successfully",
		});
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
