import React from "react";
import { useTabs } from "~hooks";

export function NewTabsPage() {
    const [tabs] = useTabs();
    return (
        <React.Fragment>
            <h2>New Items</h2>

            <ol>
                {tabs.map(tab => (
                    <li key={tab.id} style={{ margin: 0 }}>
                        <a href={tab.url} target="_blank" rel="noreferrer">{tab.title}</a>
                    </li>
                ))}
            </ol>
        </React.Fragment>
    )
}
