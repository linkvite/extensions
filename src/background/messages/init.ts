import type { User } from "@linkvite/js";
import type { PlasmoMessaging } from "@plasmohq/messaging"
import { authStore, userActions } from "~stores";
import { storage } from "~utils/storage";

export type InitResponse = {
    loggedIn: false;
} | {
    user: User;
    loggedIn: true;
    token: string;
}

const handler: PlasmoMessaging.MessageHandler<InitResponse> = async (req, res) => {
    const user = await storage.get<User>("user");
    const token = await storage.get<string>("token");

    if (user && token) {
        userActions.setData(user);
        authStore.refreshToken.set(token);

        return res.send({
            user,
            token,
            loggedIn: true,
        })
    }

    userActions.clearData();
    authStore.accessToken.set("");
    authStore.refreshToken.set("");

    return res.send({
        loggedIn: false,
    })
}

export default handler