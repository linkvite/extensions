import { browser } from "~browser";
import { APP_DOMAIN } from "~utils";
import { handleFindBookmarks } from "~api";

async function handleInputEntered(
	text: string,
	disposition: browser.Omnibox.OnInputEnteredDisposition,
) {
	const link = text
		? APP_DOMAIN + "?q=" + encodeURIComponent(text)
		: APP_DOMAIN;
	switch (disposition) {
		case "currentTab":
			await browser.tabs.update({ url: link });
			break;
		case "newForegroundTab":
			await browser.tabs.create({ url: link });
			break;
		case "newBackgroundTab":
			await browser.tabs.create({ url: link, active: false });
			break;
	}
}

async function handleInputChanged(
	text: string,
	suggest: (suggestResults: browser.Omnibox.SuggestResult[]) => void,
) {
	const bookmarks = await handleFindBookmarks({
		query: encodeURIComponent(text),
		limit: 10,
	});
	suggest(
		bookmarks.map(({ title, url }) => ({
			content: url,
			description: title + ` <url>${url}</url>`,
		})),
	);
}

export function setupOmnibox() {
	if (!browser.omnibox) {
		console.error("browser.omnibox is not available");
		return;
	}

	browser.omnibox.setDefaultSuggestion({
		description: "Search Linkvite",
	});

	browser.omnibox.onInputEntered.addListener(handleInputEntered);
	browser.omnibox.onInputChanged.addListener(handleInputChanged);
}
