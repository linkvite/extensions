import { browser } from "~browser";
import { useCallback, useEffect, useState } from "react";

/**
 * Get all the tabs from the current window.
 */
export function useTabs() {
    const [tabs, setTabs] = useState<browser.Tabs.Tab[]>([]);

    // filter out tabs that are not HTTPS or are pinned.
    // we don't want to save pinned tabs, because the user
    // will likely want to keep them hanging around.
    const filterValidTabs = (tabs: browser.Tabs.Tab[]) => {
        return tabs.filter(({ url, pinned }) => /^https:\/\//i.test(url) && !pinned);
    };

    const loadTabs = useCallback(async () => {
        try {
            const hasTabsPermission = await browser.permissions.contains({ permissions: ['tabs'] });
            if (!hasTabsPermission) {
                return;
            }

            const tabs = await browser.tabs
                .query((
                    await browser.windows.getCurrent())?.type == 'popup'
                    ? { windowType: 'normal' }
                    : { currentWindow: true }
                )
                .catch(e => {
                    console.error('Error querying tabs:', e);
                    return [];
                });

            setTabs(filterValidTabs(tabs));
        } catch (error) {
            console.error('Error loading tabs:', error);
        }
    }, []);

    useEffect(() => {
        loadTabs();
    }, [loadTabs]);

    useEffect(() => {
        const requestPermissionsAndLoadTabs = async () => {
            try {
                const hasTabsPermission = await browser.permissions.contains({ permissions: ['tabs'] });
                if (!hasTabsPermission) {
                    await browser.permissions.request({ permissions: ['tabs'] });
                    await loadTabs();
                }
            } catch (e) {
                if (e?.message.includes('user input')) {
                    return;
                }
                console.error(e);
            }
        };

        requestPermissionsAndLoadTabs();
    }, [loadTabs]);

    return [tabs, loadTabs] as const;
}