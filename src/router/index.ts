import { browser } from "~browser";

const base = '/'

/**
 * Create a new window for the given path, centered on the current window.
 *
 * @param {string} path - the path for the new window
 * @return {Promise<browser.windows.Window>} a Promise that resolves to the newly created window
 */
export async function route(path: string, newTab?: boolean) {
    const url = `${base}${path}`;
    if (newTab) {
        return await browser.tabs.create({ url });
    }

    const width = 600;
    const height = 800;
    const origin = await browser.windows.getCurrent();

    const values = {
        top: Math.round((origin.top || 0) + ((origin.height || 0) - height) / 2),
        left: Math.round((origin.left || 0) + ((origin.width || 0) - width) / 2)
    };

    return await browser.windows.create({
        url,
        width,
        height,
        type: 'popup',
        top: values.top,
        left: values.left,
    });
}

/**
 * Close the current popup tab.
 * 
 * @return {Promise<void>} a Promise that resolves when the tab is closed.
 */
export async function closeTab(now = false) {
    setTimeout(() => {
        window?.close();
    }, now ? 0 : 1000);
}
