import type { Bookmark } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleBookmarkExists } from "~api";

export type ExistsMessageRequest = {
	url: string;
};

export type ExistsMessageResponse =
	| {
			exists: false;
	  }
	| {
			exists: true;
			bookmark: Bookmark;
	  };

const handler: PlasmoMessaging.MessageHandler<
	ExistsMessageRequest,
	ExistsMessageResponse
> = async (req, res) => {
	try {
		const data = await handleBookmarkExists({
			url: req.body.url,
		});

		return res.send({
			exists: data.exists,
			bookmark: data.bookmark,
		});
	} catch (_) {
		return res.send({ exists: false });
	}
};

export default handler;
