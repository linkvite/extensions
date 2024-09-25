import type { Collection, User } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { authStore, collectionActions, userActions } from "~stores";
import { storage } from "~utils/storage";

export type InitResponse =
	| {
			loggedIn: false;
	  }
	| {
			user: User;
			loggedIn: true;
			token: string;
	  };

const handler: PlasmoMessaging.MessageHandler<InitResponse> = async (
	_,
	res,
) => {
	const user = await storage.get<User>("user");
	const token = await storage.get<string>("token");
	const collections = await storage.get<Collection[]>("collections");

	if (user && token) {
		userActions.setData(user);
		authStore.refreshToken.set(token);

		if (collections) {
			collectionActions.initialize(collections);
		}

		return res.send({
			user,
			token,
			loggedIn: true,
		});
	}

	userActions.clearData();
	authStore.accessToken.set("");
	authStore.refreshToken.set("");

	return res.send({
		loggedIn: false,
	});
};

export default handler;
