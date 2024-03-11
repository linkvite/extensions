import { settingStore } from "~stores";
import { PageProvider } from "~components/wrapper";
import { useSelector } from "@legendapp/state/react";

function OptionsIndex() {
    const store = useSelector(settingStore);
    return (
        <PageProvider noClose>
            <div style={{ width: '100%' }}>
                <h1>Linkvite</h1>
                <p>Options Page</p>
                <p>Theme: {store.theme}</p>
                <p>Collection: {store.collection}</p>
                <p>Auto Save: {store.autoSave ? "Yes" : "No"}</p>

                <p>Permissions</p>
                <ul>
                    {store.permissions.map((permission, index) => (
                        <li key={index}>{permission}</li>
                    ))}
                </ul>

                <p>Hot Keys</p>
                <ul>
                    {store.hotKeys.map((hotKey, index) => (
                        <li key={index}>{hotKey}</li>
                    ))}
                </ul>

                <p>Copied Link: {store.copiedLink}</p>

                <p>
                    <a href="/popup.html">Popup</a>
                </p>

                <p>
                    The easiest way to save and organize your bookmarks.
                </p>
            </div >
        </PageProvider>
    )
}

export default OptionsIndex
