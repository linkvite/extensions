import { browser } from "~browser";
import * as htmlparser from "htmlparser2";
import { COVER_URL, normalize } from "~utils";

export type ParsedHTML = {
    image: string;
    description: string;
}

/**
 * Parses the HTML and returns head information
 * 
 * Use the meta tags to get the information.
 * But use the regular tags as fallback.
 * 
 * @param {String} html
 * @param {Number} windowId
 */
export async function parseHTML(html: string, windowId: number): Promise<ParsedHTML> {
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
        try {
            image = await browser.tabs.captureVisibleTab(windowId, { format: "png" });
        } catch (error) {
            console.error("Error capturing visible tab: ", error);
            image = COVER_URL;
        }
    }

    return {
        image,
        description: normalize(description),
    }
}
