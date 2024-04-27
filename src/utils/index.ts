import { browser } from '~browser';
import { handleLogout } from '~api';
import { userActions } from '~stores';
import type { Bookmark } from '@linkvite/js';
import { COVER_URL, FAVICON_URL } from './env';

export * from './env';

export const NIL_OBJECT_ID = "000000000000000000000000";

export async function extLogout() {
    userActions.clearData();
    await handleLogout();
}

export async function getCurrentTab() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab;
}

/**
 * Normalize a string.
 *
 * @param {String} [word] - The word to convert to a normalized string.
 */
export function normalize(word = "") {
    return word
        .normalize('NFD')
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/[\u0300-\u036f]/g, "")
}

export function makeBookmark(): Bookmark {
    return {
        id: NIL_OBJECT_ID,
        info: {
            name: "",
            slug: "",
            collection: NIL_OBJECT_ID,
            description: "",
            status: "active",
        },
        tags: [],
        assets: {
            html: "",
            icon: FAVICON_URL,
            thumbnail: COVER_URL,
        },
        config: {
            isBroken: false,
            allowComments: true,
        },
        meta: {
            url: "",
            key: "",
            size: 0,
            views: 0,
            type: "website",
            mimeType: "text/html",
        },
        archive: {
            key: "",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastOpened: new Date(),
        updatedBy: NIL_OBJECT_ID,
        owner: NIL_OBJECT_ID,
        isLiked: false,
        role: "owner",
    };
}

/**
 * Return a singular or plural string based on the count.
 * 
 * @param {Number} count - The count to check.
 * @param {String} singular - The singular string.
 * @param {String} plural - The plural string.
 */
export function pluralize(count: number, singular: string, plural: string) {
    return count <= 1 ? singular : plural;
}

/**
 * Truncate a string.
 * 
 * Also adds an ellipsis if the string is longer than the length.
 * 
 * @param {String} str - The string to truncate.
 * @param {Number} length - The length to truncate the string to.
 * @returns The truncated string.
 */
export function subString(str = "", length: number) {
    return str.substring(0, length) + (str.length > length ? "..." : "");
}

/**
 * Parse the qr-auth url.
 * to get the string after /qr-auth/
 *
 * @param {String} data The qr-auth url.
 * @returns A parsed response object, for navigation.
 */
export function parseQRAuth(data: string) {
    const id = data.indexOf("/qr-auth/") > -1
        ? data.substring(data.indexOf("/qr-auth/") + 9)
        : "";

    return { id };
}