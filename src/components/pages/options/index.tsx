import { useSelector } from "@legendapp/state/react";
import type { Collection } from "@linkvite/js";
import { useEffect, useState } from "react";
import { CollectionsModal } from "~components/collections";
import { AppDialog } from "~components/primitives/dialog";
import { AppText } from "~components/text";
import { useAuth } from "~components/wrapper/auth";
import { settingStore, userStore } from "~stores";
import type { Theme } from "~types";
import { storage } from "~utils/storage";
import {
	AutoCheckInput,
	AutoContainers,
	CollectionContainer,
	Label,
	LogoutButton,
	OptionsContainer,
	ThemeSelect,
} from "./styles";

export function OptionsPage() {
	const { logout } = useAuth();
	const settings = useSelector(settingStore);
	const { name, username } = useSelector(userStore);
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

			<Label>Collection</Label>
			<AppDialog
				minHeight={300}
				title="Collection"
				trigger={
					<CollectionContainer>
						{collection ? collection.name : "No Collection Selected"}
					</CollectionContainer>
				}
			>
				<CollectionsModal
					collection={collection}
					setCollection={setCollection}
				/>
			</AppDialog>

			<AutoContainers>
				<AutoCheckInput
					type="checkbox"
					checked={settings.autoSave}
					onChange={() => settingStore.autoSave.set(!settings.autoSave)}
					id="autoSave"
				/>
				<Label htmlFor="autoSave">Auto Save</Label>
			</AutoContainers>

			<AutoContainers>
				<AutoCheckInput
					type="checkbox"
					checked={settings.autoClose}
					onChange={() => settingStore.autoClose.set(!settings.autoClose)}
					id="autoClose"
				/>
				<Label htmlFor="autoClose">Auto Close</Label>
			</AutoContainers>

			<AppDialog
				title="Logout"
				minHeight={100}
				trigger={<LogoutButton>Logout</LogoutButton>}
			>
				<AppText>Are you sure you want to logout?</AppText>
				<LogoutButton onClick={logout}>Logout</LogoutButton>
			</AppDialog>

			<Label
				style={{
					marginTop: 10,
					width: "100%",
					textAlign: "center",
				}}
			>
				Logged in as {name || `@${username}`}
			</Label>
		</OptionsContainer>
	);
}
