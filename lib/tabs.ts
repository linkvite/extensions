/**
 * Open a URL in a regular browser window and bring it to the front.
 *
 * The context-menu save window is a `type: 'popup'` window, and a tab created
 * from it goes nowhere visible (popup windows can't hold extra tabs), so
 * "Open" and links did nothing there. Target the last focused normal window
 * instead, or make one, and close the save window once the tab is open.
 */
export async function openTab(url: string): Promise<void> {
	const windows = await browser.windows
		.getAll({windowTypes: ['normal']})
		.catch(() => []);
	const target =
		windows.find((w) => w.focused) ??
		[...windows].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0];

	if (target?.id !== undefined) {
		await browser.tabs.create({url, windowId: target.id, active: true});
		await browser.windows.update(target.id, {focused: true});
	} else {
		await browser.windows.create({url, type: 'normal', focused: true});
	}

	// the toolbar popup closes on blur by itself; the save window doesn't
	if (new URLSearchParams(location.search).has('window')) window.close();
}
