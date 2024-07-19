import type { Bookmark } from "@linkvite/js";
import { handleLogout } from "~api";
import { browser } from "~browser";
import { userActions } from "~stores";
import { COVER_URL, FAVICON_URL } from "./env";

export * from "./env";

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
		.normalize("NFD")
		.replace(/(\r\n|\n|\r)/gm, "")
		.replace(/[\u0300-\u036f]/g, "");
}

export function makeBookmark() {
	return {
		id: "",
		title: "",
		collection_id: null,
		description: "",
		status: "active",
		tags: "",
		icon: FAVICON_URL,
		thumbnail: COVER_URL,
		is_broken: false,
		allow_comments: true,
		url: "",
		size: 0,
		type: "website",
		mime_type_id: 0,
		created_at: new Date(),
		updated_at: new Date(),
		last_opened_at: new Date(),
		starred: false,
		role: "admin",
	} as Bookmark;
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
	const id =
		data.indexOf("/qr-auth/") > -1
			? data.substring(data.indexOf("/qr-auth/") + 9)
			: "";

	return { id };
}

/**
 * Convert a string to an array of unique tags.
 *
 * @param {String} tags The tags to convert.
 * @returns {String[]} An array of unique tags.
 */
export function convertToTags(tags = "") {
	// skip if null--this was from a breaking change in the API.
	if (!tags) {
		return [];
	}

	return Array.from(
		new Set(
			tags
				.split(",")
				.map((t) => t.trim().toLowerCase().replace(/\s/g, ""))
				.filter(Boolean),
		),
	);
}
