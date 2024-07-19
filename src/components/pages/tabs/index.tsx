import type { Collection } from "@linkvite/js";
import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";
import { FcOpenedFolder } from "react-icons/fc";
import {
	MdRadioButtonChecked as Checked,
	MdRadioButtonUnchecked as Unchecked,
} from "react-icons/md";
import type { CreateTabBookmarkProps } from "~api";
import type { TabsMessageResponse } from "~background/messages/tabs";
import { browser } from "~browser";
import {
	InputContainer,
	InputField,
	InputFieldLine,
	SelectCollectionImage,
} from "~components/bookmark/styles";
import { CollectionsModal } from "~components/collections";
// import { useSelector } from "@legendapp/state/react";
import { AppDialog } from "~components/primitives/dialog";
import { Spinner } from "~components/spinner";
import { useTabs, useTheme } from "~hooks";
import { pluralize, subString } from "~utils";
// import { settingStore } from "~stores";
import { storage } from "~utils/storage";
// import { closeTab } from "~router";
import { Colors } from "~utils/styles";
import {
	TabAddButton,
	TabAddButtonContainer,
	TabContainer,
	TabDescriptionInput,
	TabEditButton,
	TabList,
	TabListItem,
	TabListItemCheck,
	TabListItemDescription,
	TabListItemInfo,
	TabListItemTitle,
	TabListItemUrl,
	TabPermissionButton,
	TabPermissionHeader,
	TabPermissionText,
	TabSelectCollectionButton,
} from "./styles";

type Tab = browser.Tabs.Tab & {
	tags?: string[];
	description?: string;
};

export function NewTabsPage() {
	const [loadTabs] = useTabs();
	const { theme } = useTheme();
	const [state, setState] = useState({
		saving: false,
		submitHovered: false,
		tabHovered: null as number | null,
	});

	// const {
	//     autoClose,
	// } = useSelector(settingStore);
	const [tabs, setTabs] = useState<Tab[]>([]);
	const [selected, setSelected] = useState([] as number[]);
	const [collection, setCollection] = useState<Collection>();
	const [hasTabsPermission, setHasTabsPermission] = useState(false);

	const countText = useMemo(() => {
		if (selected.length === 0) {
			return "No tabs selected";
		}
		if (selected.length === tabs.length) {
			return "All tabs selected";
		}
		return `${selected.length} of ${tabs.length} ${pluralize(
			tabs.length,
			"tab",
			"tabs",
		)} selected`;
	}, [selected, tabs]);

	const saveToName = useMemo(() => {
		if (collection) {
			return `Save to ${subString(collection.name, 15)}`;
		}

		return "Save";
	}, [collection]);

	const onTabHover = useCallback((id: number) => {
		setState((prev) => ({ ...prev, tabHovered: id }));
	}, []);

	const onSubmitHover = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, submitHovered: value }));
	}, []);

	const onSelectCollection = useCallback((c?: Collection) => {
		setCollection(c);
	}, []);

	const onChangeText = useCallback(
		(value: string, key: string) => {
			const updatedTabs = tabs.map((tab) => {
				if (tab.id === state.tabHovered) {
					return {
						...tab,
						[key]: value,
					};
				}

				return tab;
			});

			setTabs(updatedTabs);
		},
		[tabs, state.tabHovered],
	);

	const onSave = useCallback(async () => {
		if (selected.length === 0) {
			toast.error("No tabs selected");
			return;
		}

		setState((prev) => ({ ...prev, saving: true }));

		const data = tabs
			.filter((tab) => selected.includes(tab.id) && tab.url)
			.map((tab) => ({
				url: tab.url,
				title: tab.title || "Untitled",
				description: tab.description || "",
				tags: (tab.tags || []).join(",") || "",
			}));

		const resp = await sendToBackground<
			CreateTabBookmarkProps,
			TabsMessageResponse
		>({
			name: "tabs",
			body: {
				tabs: data,
				collection: collection?.id,
			},
		});

		setState((prev) => ({ ...prev, saving: false }));

		if ("error" in resp) {
			toast.error(resp.error);
			return;
		}

		toast.success(resp.message);
		// if (autoClose) {
		//     closeTab();
		// }
	}, [collection?.id, selected, tabs]);

	const requestTabsPermission = useCallback(async () => {
		if (hasTabsPermission) {
			return;
		}
		try {
			const granted = await browser.permissions.request({
				permissions: ["tabs"],
			});
			if (!granted) {
				toast.error("You need to grant tabs permission to use this feature");
				return;
			}

			setHasTabsPermission(true);
			const initialTabs = await loadTabs();
			setTabs(initialTabs);
			setSelected(initialTabs.map((tab) => tab.id));
		} catch (error) {
			console.error("Error requesting tabs permission:", error);
			toast.error("Error requesting tabs permission");
		}
	}, [hasTabsPermission, loadTabs]);

	useLayoutEffect(() => {
		async function init() {
			const hasTabsPermission = await browser.permissions.contains({
				permissions: ["tabs"],
			});
			setHasTabsPermission(hasTabsPermission);

			if (hasTabsPermission) {
				const initialTabs = await loadTabs();
				setTabs(initialTabs);
				setSelected(initialTabs.map((tab) => tab.id));
			}

			const defaultCollection = await storage.get<Collection>("collection");
			onSelectCollection(defaultCollection);
		}

		init();
	}, [loadTabs, onSelectCollection]);

	if (!hasTabsPermission) {
		return (
			<TabContainer>
				<TabPermissionHeader>Permission Required</TabPermissionHeader>

				<TabPermissionText>
					This feature requires permission to access your tabs. Please grant the
					permission to continue.
				</TabPermissionText>

				<TabPermissionButton onClick={requestTabsPermission}>
					Grant Permission
				</TabPermissionButton>
			</TabContainer>
		);
	}

	function onSelect(id: number) {
		selected.includes(id)
			? setSelected(selected.filter((i) => i !== id))
			: setSelected([...selected, id]);
	}

	return (
		<TabContainer>
			<TabList>
				<TabPermissionHeader>{countText}</TabPermissionHeader>

				{tabs.map((tab) => (
					<TabListItem
						key={tab.id}
						onClick={() => onSelect(tab.id)}
						onMouseEnter={() => onTabHover(tab.id)}
						onMouseLeave={() => onTabHover(tab.id)}
					>
						<TabListItemCheck onClick={() => onSelect(tab.id)}>
							{selected.includes(tab.id) ? (
								<Checked color={Colors.primary} size={20} />
							) : (
								<Unchecked color={Colors.primary} size={20} />
							)}
						</TabListItemCheck>

						<TabListItemInfo>
							<TabListItemTitle>{tab.title || "Untitled"}</TabListItemTitle>

							{tab.description ? (
								<TabListItemDescription isSubText>
									{tab.description}
								</TabListItemDescription>
							) : null}

							<TabListItemUrl isSubText>
								{subString(tab.url, 50)}
							</TabListItemUrl>
						</TabListItemInfo>

						<AppDialog
							title="Edit Tab"
							minHeight={200}
							trigger={
								<TabEditButton $hide={state.tabHovered !== tab.id}>
									<AiOutlineEdit size={20} color={Colors.primary} />
								</TabEditButton>
							}
						>
							<InputContainer style={{ backgroundColor: theme.trans_bg }}>
								<InputField
									value={tab.title}
									placeholder={"Add a Title"}
									onChange={(e) => onChangeText(e.target.value, "title")}
								/>

								<InputFieldLine $isName />

								<TabDescriptionInput
									value={tab.description}
									placeholder={"Add a Description"}
									onChange={(e) => onChangeText(e.target.value, "description")}
								/>
							</InputContainer>
						</AppDialog>
					</TabListItem>
				))}
			</TabList>

			<TabAddButtonContainer $active={selected.length > 0}>
				<TabAddButton
					onClick={onSave}
					disabled={state.saving}
					$active={selected.length > 0}
					onMouseEnter={() => onSubmitHover(true)}
					onMouseLeave={() => onSubmitHover(false)}
				>
					{state.saving ? (
						<>
							<span style={{ marginRight: 10 }}>Saving</span>
							<Spinner size={13} />
						</>
					) : (
						saveToName
					)}
				</TabAddButton>

				<AppDialog
					minHeight={300}
					title="Collection"
					trigger={
						<TabSelectCollectionButton
							$hide={state.submitHovered || state.saving}
						>
							{collection ? (
								<SelectCollectionImage
									alt={collection.name}
									src={collection.icon}
								/>
							) : (
								<FcOpenedFolder size={30} color={Colors.light} />
							)}
						</TabSelectCollectionButton>
					}
				>
					<CollectionsModal
						collection={collection}
						setCollection={onSelectCollection}
					/>
				</AppDialog>
			</TabAddButtonContainer>
		</TabContainer>
	);
}
