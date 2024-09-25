import type { Collection } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleCreateCollection } from "~api";
import { collectionActions } from "~stores";

export type CreateCollectionRequest = {
	name: string;
};

export type CreateCollectionResponse =
	| {
			data: Collection;
	  }
	| {
			error: string;
	  };

const handler: PlasmoMessaging.MessageHandler<
	CreateCollectionRequest,
	CreateCollectionResponse
> = async (req, res) => {
	try {
		const data = await handleCreateCollection({
			name: req.body.name,
		});
		collectionActions.add(data);
		return res.send({ data });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
