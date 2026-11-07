/** What a page says about itself (its <head> metadata). */
export type PageInfo = {
	url: string;
	title: string;
	description: string;
	image: string;
	favicon: string;
};

/** Runs in the page (scripting.executeScript): read title, description, image, icon. */
function readPage(): PageInfo {
	const meta = (...keys: string[]) => {
		for (const k of keys) {
			const el = document.querySelector<HTMLMetaElement>(
				`meta[property="${k}"], meta[name="${k}"]`,
			);
			if (el?.content) return el.content.trim();
		}
		return '';
	};
	const abs = (u: string) => {
		try {
			return u ? new URL(u, document.baseURI).href : '';
		} catch {
			return '';
		}
	};
	const icon = document.querySelector<HTMLLinkElement>(
		'link[rel~="icon"], link[rel="apple-touch-icon"]',
	);
	return {
		url: location.href,
		title:
			meta('og:title', 'twitter:title') || document.title || location.hostname,
		description: meta('og:description', 'twitter:description', 'description'),
		image: abs(meta('og:image', 'og:image:url', 'twitter:image')),
		favicon: abs(icon?.getAttribute('href') ?? '/favicon.ico'),
	};
}

/** The tab's own metadata, or null where scripts can't run (browser pages, stores, PDFs). */
export async function pageInfo(tabId: number): Promise<PageInfo | null> {
	try {
		const [res] = await browser.scripting.executeScript({
			target: {tabId},
			func: readPage,
		});
		return (res?.result as PageInfo | undefined) ?? null;
	} catch {
		return null;
	}
}

export async function activeTab(): Promise<Browser.tabs.Tab | undefined> {
	const [tab] = await browser.tabs.query({active: true, currentWindow: true});
	return tab;
}

export const isSavable = (url?: string) => !!url && /^https?:\/\//i.test(url);
