import { browser } from "~browser";
import type { PlasmoMessaging } from "@plasmohq/messaging";

export type ParseHTMLMessageRequest = {
	id: number;
};

export type ParseHTMLMessageResponse =
	| {
			data: browser.Scripting.InjectionResult[];
	  }
	| { error: string };

const handler: PlasmoMessaging.MessageHandler<
	ParseHTMLMessageRequest,
	ParseHTMLMessageResponse
> = async (req, res) => {
	try {
		const tab = await browser.tabs.get(req.body.id);
		if (!tab) {
			return res.send({ error: "Tab not found" });
		}

		if (tab.url && !tab.url.startsWith("http")) {
			return res.send({ error: "Only HTTP(S) URLs are supported" });
		}

		const result = await browser.scripting.executeScript({
			target: { tabId: tab.id },
			func: () => document.documentElement.outerHTML,
		});

		return res.send({ data: result });
	} catch (error) {
		if (typeof error === "string") {
			return res.send({ error });
		}
		return res.send({ error: error.message });
	}
};

export default handler;
