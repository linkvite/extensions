import { browser } from "~browser";
import { getCurrentTab } from "~utils";
import { PageProvider } from "~components/wrapper";
import { useCallback, useEffect, useState } from "react";

function IndexPopup() {
    const [data, setData] = useState<browser.Tabs.Tab>()
    const currentTab = useCallback(async () => {
        const tab = await getCurrentTab();
        setData(tab);
    }, []);

    useEffect(() => {
        currentTab();
    }, [currentTab]);

    return (
        <PageProvider noClose>
            <div style={{ width: '100%' }}>
                <h1>Linkvite</h1>
                <p>Title: {data?.title}</p>
                <p>URL: {data?.url}</p>
                <p>Favicon: {data?.favIconUrl}</p>
                <img src={data?.favIconUrl} alt="favicon" height={60} width={60} />
                <br />
                <p>
                    The easiest way to save and organize your bookmarks.
                </p>
            </div >
        </PageProvider>
    )
}

export default IndexPopup
