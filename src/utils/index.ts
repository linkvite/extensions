import { browser } from '~browser';
import { storage } from './storage';
import { handleLogout } from '~api';
import { userActions } from '~stores';

export * from './env';
export async function extLogout() {
    storage.clear();
    userActions.clearData();
    await handleLogout();
}

export async function getCurrentTab() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab;
}

export async function getCurrentWindow() {
    return await browser.windows.getCurrent();
}
