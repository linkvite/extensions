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
    const tab = await getCurrentTab();

    async function onNewBookmark() {
        const base = 'tabs/create.html?url=';
        if (!tab) return;
        const { title, favIconUrl, id } = tab;
        return await route(`${base}${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}&favicon=${encodeURIComponent(favIconUrl)}&tabId=${id}`);
    }

    const base = 'tabs/new.html?url=';
    switch (menuItemId) {
        case 'new:link':
            return await route(`${base}${encodeURIComponent(linkUrl)}&type=link&tabId=${tab?.id}`)
        case 'new:image':
            return await route(`${base}${encodeURIComponent(srcUrl)}&type=image`)
        case 'save:tabs':
            return await route('tabs/tabs.html')
        case 'options':
            return await route('options.html')
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