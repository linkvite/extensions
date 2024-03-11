import { route } from "~router";
import { browser } from "~browser";

type Menu = {
    id: string
    title: string
    contexts: browser.Menus.ContextType[]
}

const menus: Menu[] = [
    { id: 'new:page', title: "Bookmark this page", contexts: ['page'] },
    { id: 'new:link', title: "Save link", contexts: ['link'] },
    { id: 'new:video', title: "Save video", contexts: ['video'] },
    { id: 'new:image', title: "Save image", contexts: ['image'] },
    { id: 'new:note', title: "Note", contexts: ['selection'] },
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

async function handleClick({ pageUrl, linkUrl, srcUrl, selectionText, menuItemId }: browser.Menus.OnClickData) {
    const base = 'tabs/new.html?link='
    switch (menuItemId) {
        case 'new:page':
            return await route(`${base}${encodeURIComponent(pageUrl)}`)
        case 'new:link':
            return await route(`${base}${encodeURIComponent(linkUrl)}`)
        case 'new:video':
            return await route(`${base}${encodeURIComponent(srcUrl)}`)
        case 'new:image':
            return await route(`${base}${encodeURIComponent(srcUrl)}`)
        case 'new:note':
            if (!selectionText) {
                return;
            }

            return await route(`${base}${encodeURIComponent(pageUrl)}&note=${encodeURIComponent(selectionText)}`)
        case 'save:tabs':
            return await route('tabs/tabs.html')
        case 'options':
            return await route('options.html')
        case 'open:app':
            return await browser.tabs.create({ url: 'https://app.linkvite.io' })
        default:
            break
    }
}

export async function setupContextMenus() {
    if (!browser.contextMenus) {
        console.error('browser.contextMenus is not available')
        return;
    }

    create()
    browser.contextMenus.onClicked.addListener(handleClick)
}