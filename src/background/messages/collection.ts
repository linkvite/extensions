import type { Collection } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleFindCollection } from "~api";

export type FindCollectionRequest = {
	id: string;
};

export type FindCollectionResponse =
	| {
			data: Collection;
	  }
	| {
			error: string;
	  };

const handler: PlasmoMessaging.MessageHandler<
	FindCollectionRequest,
	FindCollectionResponse
> = async (req, res) => {
	try {
		const data = await handleFindCollection({
			id: req.body.id,
		});
		return res.send({ data });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
