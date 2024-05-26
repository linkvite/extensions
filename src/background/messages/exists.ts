import { handleBookmarkExists } from "~api";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Bookmark } from "@linkvite/js";

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
