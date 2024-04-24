import type { Theme } from "~types";
import { storage } from "~utils/storage";
import { AppText } from "~components/text";
import type { Collection } from "@linkvite/js";
import { settingStore, userStore } from "~stores";
import { useAuth } from "~components/wrapper/auth";
import React, { useEffect, useState } from "react";
import { useSelector } from "@legendapp/state/react";
import { AppDialog } from "~components/primitives/dialog";
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
    const user = useSelector(userStore);
    const settings = useSelector(settingStore);
    const [collection, setCollection] = useState<Collection | null>(null);
    useEffect(() => {
        async function init() {
            const c = await storage.get<Collection>("collection");
            setCollection(c || null);
        }

        init();
    }, []);

    return (
        <OptionsContainer>
            <Label htmlFor="theme">Theme</Label>
            <ThemeSelect
                id="theme"
                value={settings.theme}
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
                    setCollection={setCollection}
                />
            </AppDialog>

            <AutoContainers>
                <AutoCheckInput type="checkbox" checked={settings.autoSave} onChange={() => settingStore.autoSave.set(!settings.autoSave)} id="autoSave" />
                <Label htmlFor="autoSave">Auto Save</Label>
            </AutoContainers>

            <AutoContainers>
                <AutoCheckInput type="checkbox" checked={settings.autoClose} onChange={() => settingStore.autoClose.set(!settings.autoClose)} id="autoClose" />
                <Label htmlFor="autoClose">Auto Close</Label>
            </AutoContainers>

            <Label
                style={{ marginTop: 15 }}
            >
                Logged in as: {user.username}
            </Label>

            <AppDialog
                title="Logout"
                minHeight={100}
                trigger={
                    <LogoutButton>Logout</LogoutButton>
                }
            >
                <AppText>Are you sure you want to logout?</AppText>
                <LogoutButton
                    onClick={logout}
                    style={{ marginTop: 20 }}
                >
                    Logout
                </LogoutButton>
            </AppDialog>
        </OptionsContainer >
    )
}