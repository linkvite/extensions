import type { Collection } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { handleGetCollections } from "~api";
import { collectionActions } from "~stores";
import { storage } from "~utils/storage";

export type FindCollectionsResponse =
	| {
			data: Collection[];
	  }
	| {
			error: string;
	  };

const handler: PlasmoMessaging.MessageHandler<
	undefined,
	FindCollectionsResponse
> = async (_, res) => {
	try {
		const data = await handleGetCollections();
		collectionActions.initialize(data);
		await storage.set("collections", data);
		return res.send({ data });
	} catch (error) {
		return res.send({ error: String(error) });
	}
};

export default handler;
