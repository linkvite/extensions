import type { Collection } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleFindCollections } from "~api";

export type FindCollectionsRequest = {
	query: string;
	limit?: number;
	owner?: string;
};

export type FindCollectionsResponse =
	| {
			data: Collection[];
	  }
	| {
			error: string;
	  };

const handler: PlasmoMessaging.MessageHandler<
	FindCollectionsRequest,
	FindCollectionsResponse
> = async (req, res) => {
	try {
		const data = await handleFindCollections({
			query: req.body.query,
			limit: req.body.limit,
			owner: req.body.owner,
		});
		return res.send({ data });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
