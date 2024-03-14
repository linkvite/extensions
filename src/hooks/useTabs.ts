import { browser } from "~browser";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
                .catch(err => {
                    toast.error('Error loading tabs');
                    console.error('Error loading tabs:', err);
                    return [];
                });

            setTabs(filterValidTabs(tabs));
        } catch (error) {
            toast.error('Error loading tabs');
            console.error('Error loading tabs:', error);
        }
    }, []);

    useEffect(() => {
        loadTabs();
    }, [loadTabs]);

    return [tabs, loadTabs] as const;
}