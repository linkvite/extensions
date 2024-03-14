import { useTabs } from "~hooks";
import { browser } from "~browser";
import toast from "react-hot-toast";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { AppText } from "~components/text";

export function NewTabsPage() {
    const [tabs, loadTabs] = useTabs();
    const [hasTabsPermission, setHasTabsPermission] = useState(false);

    const requestTabsPermission = useCallback(async () => {
        if (hasTabsPermission) return;
        try {
            const granted = await browser.permissions.request({ permissions: ['tabs'] });
            if (!granted) {
                toast.error('You must grant tabs permission to use this feature');
                return;
            }

            setHasTabsPermission(true);
            loadTabs();
        } catch (error) {
            console.error('Error requesting tabs permission:', error);
            toast.error('Error requesting tabs permission');
        }
    }, [hasTabsPermission, loadTabs]);

    useLayoutEffect(() => {
        async function init() {
            const hasTabsPermission = await browser.permissions.contains({ permissions: ['tabs'] });
            setHasTabsPermission(hasTabsPermission);
        }

        init();
    }, []);

    return (
        <React.Fragment>
            <h2>Tabs</h2>

            <ol>
                {tabs.map(tab => (
                    <li key={tab.id} style={{ margin: 0 }}>
                        <a href={tab.url} target="_blank" rel="noreferrer">{tab.title}</a>
                    </li>
                ))}
            </ol>

            {!hasTabsPermission && (
                <React.Fragment>
                    <AppText bottomSpacing="sm">
                        You must grant tabs permission to use this feature
                    </AppText>
                    <button onClick={requestTabsPermission}>Grant permission</button>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}
