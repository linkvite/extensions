import { useTabs } from "~hooks";
import { PageProvider } from "~components/wrapper";

function AddTabsPage() {
    const [tabs] = useTabs();
    return (
        <PageProvider>
            <div style={{ width: '100%' }}>
                <h2>New Items</h2>

                <ol>
                    {tabs.map(tab => (
                        <li key={tab.id} style={{ margin: 0 }}>
                            <a href={tab.url} target="_blank" rel="noreferrer">{tab.title}</a>
                        </li>
                    ))}
                </ol>
            </div>
        </PageProvider>
    )
}

export default AddTabsPage
