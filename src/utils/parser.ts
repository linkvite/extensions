import { browser } from "~browser";
import { getCurrentTab, normalize } from "~utils";
import * as htmlparser from "htmlparser2";

export type ParsedHTML = {
    image: string;
    description: string;
}

/**
 * Parses the HTML and returns head information
 * 
 * Use the meta tags to get the information.
 * But use the regular tags as fallback.
 */
export async function parseHTML(html: string): Promise<ParsedHTML> {
    let image = "";
    let description = "";

    const parser = new htmlparser.Parser({
        onopentag: (name, attrib) => {
            if (name === 'meta') {
                if (attrib?.property === 'og:image' || attrib?.name === 'og:image') {
                    image = attrib?.content;
                }
                if (attrib?.property === 'og:description' || attrib?.name === 'og:description') {
                    description = attrib?.content;
                }
                if (attrib?.name === 'description') {
                    description = attrib?.content;
                }
            }
        },
    }, { decodeEntities: true });
    parser.write(html);
    parser.end();

    if (!image) {
        const tab = await getCurrentTab();
        image = await browser.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    }

    return {
        image,
        description: normalize(description),
    }
}
