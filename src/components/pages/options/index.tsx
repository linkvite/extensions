import React, { useCallback, useEffect, useState } from "react";
import type { Theme } from "~types";
import { settingStore } from "~stores";
import { useAuth } from "~components/wrapper/auth";
import { useSelector } from "@legendapp/state/react";
import { AppDialog } from "~components/primitives/dialog";
import type { Collection } from "@linkvite/js";
import { storage } from "~utils/storage";
import { CollectionsModal } from "~components/collections";
import {
    OptionsContainer,
    Label,
    ThemeSelect,
    CollectionContainer,
    AutoContainers,
    AutoCheckInput,
    LogoutButton
} from "./styles";

export function OptionsPage() {
    const { logout } = useAuth();
    const store = useSelector(settingStore);
    const [collection, setCollection] = useState<Collection | null>(null);
    useEffect(() => {
        async function init() {
            const c = await storage.get<Collection>("collection");
            if (c) {
                setCollection(c);
            }
        }

        init();
    }, []);

    const onSelectCollection = useCallback((c?: Collection) => {
        setCollection(c || null);
        storage.set("collection", c);
    }, []);

    return (
        <OptionsContainer>
            <Label htmlFor="theme">Theme</Label>
            <ThemeSelect
                id="theme"
                value={store.theme}
                onChange={(e) => settingStore.theme.set(e.target.value as Theme)}
            >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
            </ThemeSelect>

            <Label>Default Collection</Label>
            <AppDialog
                minHeight={300}
                title="Collection"
                trigger={
                    <CollectionContainer>
                        {collection
                            ? collection.info.name
                            : "Set Default Collection"
                        }
                    </CollectionContainer>
                }
            >
                <CollectionsModal
                    collection={collection}
                    setCollection={onSelectCollection}
                />
            </AppDialog>

            <AutoContainers>
                <AutoCheckInput type="checkbox" checked={store.autoSave} onChange={() => settingStore.autoSave.set(!store.autoSave)} id="autoSave" />
                <Label htmlFor="autoSave">Auto Save</Label>
            </AutoContainers>

            <AutoContainers>
                <AutoCheckInput type="checkbox" checked={store.autoClose} onChange={() => settingStore.autoClose.set(!store.autoClose)} id="autoClose" />
                <Label htmlFor="autoClose">Auto Close</Label>
            </AutoContainers>

            <LogoutButton onClick={logout}>Logout</LogoutButton>
        </OptionsContainer >
    )
}