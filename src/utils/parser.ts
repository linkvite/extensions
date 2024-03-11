export type ParsedHTML = {
    title: string;
    image: string;
    description: string;
}

/**
 * Parses the HTML and returns head information
 * 
 * Use the meta tags to get the information.
 * But use the regular tags as fallback.
 */
export function parse(html: string): ParsedHTML {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let title = "";
    let image = "";
    let description = "";

    const titleTag = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    if (titleTag) {
        title = titleTag;
    }

    if (!title) {
        title = doc.querySelector('title')?.textContent || '';
    }

    const imageTag = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    if (imageTag) {
        image = imageTag;
    }

    if (!image) {
        image = doc.querySelector('img')?.getAttribute('src') || '';
    }

    const descriptionTag = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    if (descriptionTag) {
        description = descriptionTag;
    }

    if (!description) {
        description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    }

    return {
        title,
        image,
        description
    }
}
