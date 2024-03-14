import { settingStore } from "~stores";
import { useSelector } from "@legendapp/state/react";
import React from "react";
import { useAuth } from "~components/wrapper/auth";

export function OptionsPage() {
    const { logout } = useAuth();
    const store = useSelector(settingStore);
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <h3>Options Page</h3>
            <p>Theme: {store.theme}</p>
            <p>Collection: {store.collection}</p>

            <p>Auto Save: {store.autoSave ? "Yes" : "No"}</p>
            <label htmlFor="autoSave">Auto Save</label>
            <input type="checkbox" checked={store.autoSave} onChange={() => settingStore.autoSave.set(!store.autoSave)} id="autoSave" />

            <p>Auto Close Popup: {store.autoClose ? "Yes" : "No"}</p>
            <label htmlFor="autoClose">Auto Close Popup</label>
            <input type="checkbox" checked={store.autoClose} onChange={() => settingStore.autoClose.set(!store.autoClose)} id="autoClose" />

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

            <button onClick={logout}>Logout</button>
        </div >
    )
}