import { route } from "~router";
import { browser } from "~browser";
import { getCurrentTab } from "~utils";

type Menu = {
    id: string
    title: string
    contexts: browser.Menus.ContextType[]
}

const menus: Menu[] = [
    { id: 'new:bookmark', title: "Bookmark", contexts: ['page'] },
    { id: 'new:link', title: "Save link", contexts: ['link'] },
    { id: 'new:image', title: "Save image", contexts: ['image'] },
    { id: 'options', title: "Options", contexts: ['action'] },
    { id: 'save:tabs', title: "Save all tabs", contexts: ['action'] },
    { id: 'open:app', title: "Open Linkvite", contexts: ['action'] }
];

async function create() {
    if (browser.contextMenus) {
        await browser.contextMenus.removeAll()
    }

    for (const menu of menus) {
        if (!browser.contextMenus) continue;
        await browser.contextMenus.create({
            id: menu.id,
            title: menu.title,
            contexts: menu.contexts
        })
    }
}

async function handleClick({ pageUrl, linkUrl, srcUrl, menuItemId }: browser.Menus.OnClickData) {
    const base = 'tabs/index.html?type';

    async function onNewBookmark() {
        const tab = await getCurrentTab();
        if (!tab) return;
        const { title, favIconUrl, id } = tab;
        return await route(`${base}=bookmark&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}&favicon=${encodeURIComponent(favIconUrl)}&tabId=${id}`);
    }

    async function onNewLink() {
        const tab = await getCurrentTab();
        if (!tab) return;
        return await route(`${base}=link&url=${encodeURIComponent(linkUrl)}&tabId=${tab?.id}`);
    }

    switch (menuItemId) {
        case 'new:link':
            return onNewLink();
        case 'new:image':
            return await route(`${base}=image&url=${encodeURIComponent(srcUrl)}`)
        case 'save:tabs':
            return await route(`${base}=tabs`)
        case 'options':
            return await route(`${base}=options`)
        case 'open:app':
            return await browser.tabs.create({ url: 'https://app.linkvite.io' })
        case 'new:bookmark':
            return onNewBookmark();
        default:
            break
    }
}

export async function setupContextMenus() {
    if (!browser.contextMenus) {
        console.error('browser.contextMenus is not available');
        return;
    }

    create()
    browser.contextMenus.onClicked.addListener(handleClick)
}