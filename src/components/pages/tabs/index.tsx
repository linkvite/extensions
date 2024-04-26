import { useTabs } from "~hooks";
import { browser } from "~browser";
import toast from "react-hot-toast";
import React, {
    useCallback,
    useLayoutEffect,
    useMemo,
    useState
} from "react";
import {
    MdRadioButtonChecked as Checked,
    MdRadioButtonUnchecked as Unchecked
} from "react-icons/md";
import {
    TabContainer,
    TabPermissionText,
    TabPermissionHeader,
    TabPermissionButton,
    TabList,
    TabListItem,
    TabListItemCheck,
    TabListItemInfo,
    TabListItemTitle,
    TabListItemUrl,
    TabListItemDescription,
    TabAddButton,
    TabAddButtonContainer,
    TabSelectCollectionButton,
} from "./styles";
import { Colors } from "~utils/styles";
import { storage } from "~utils/storage";
import type { Collection } from "@linkvite/js";
import { FcOpenedFolder } from "react-icons/fc";
import { AppDialog } from "~components/primitives/dialog";
import { CollectionsModal } from "~components/collections";
import { SelectCollectionImage } from "~components/bookmark/styles";
import { Spinner } from "~components/spinner";
import { useSelector } from "@legendapp/state/react";
import { settingStore } from "~stores";
import { closeTab } from "~router";

type Tab = browser.Tabs.Tab & {
    tags?: string[];
    description?: string;
}

export function NewTabsPage() {
    const [loadTabs] = useTabs();
    const [state, setState] = useState({
        saving: false,
        hovered: false,
    });

    const {
        autoClose,
    } = useSelector(settingStore);
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [selected, setSelected] = useState([] as number[]);
    const [collection, setCollection] = useState<Collection>();
    const [hasTabsPermission, setHasTabsPermission] = useState(false);

    function subString(str = "", length: number) {
        return str.substring(0, length) + (str.length > length ? "..." : "");
    }

    const countText = useMemo(() => {
        if (selected.length === 0) return "No tabs selected";
        if (selected.length === tabs.length) return "All tabs selected";
        return `${selected.length} of ${tabs.length} tab${tabs.length > 1 ? "s" : ""} selected`;
    }, [selected, tabs]);

    const saveToName = useMemo(() => {
        if (collection) {
            return `Save to ${subString(collection.info.name, 15)}`;
        }

        return "Save";
    }, [collection]);

    const onHover = useCallback((value: boolean) => {
        setState({ ...state, hovered: value });
    }, [state]);

    const onSelectCollection = useCallback((c?: Collection) => {
        setCollection(c);
    }, []);

    const onSave = useCallback(async () => {
        if (selected.length === 0) {
            toast.error('No tabs selected');
            return;
        }

        setState({ hovered: false, saving: true });

        setTimeout(() => {
            setState({ hovered: false, saving: false });
            toast.success('Tabs saved successfully');

            if (autoClose) {
                closeTab();
            }
        }, 5000);
    }, [autoClose, selected]);

    const requestTabsPermission = useCallback(async () => {
        if (hasTabsPermission) return;
        try {
            const granted = await browser.permissions.request({ permissions: ['tabs'] });
            if (!granted) {
                toast.error('You need to grant tabs permission to use this feature');
                return;
            }

            setHasTabsPermission(true);
            const initialTabs = await loadTabs();
            setTabs(initialTabs);
            setSelected(initialTabs.map(tab => tab.id));
        } catch (error) {
            console.error('Error requesting tabs permission:', error);
            toast.error('Error requesting tabs permission');
        }
    }, [hasTabsPermission, loadTabs]);

    useLayoutEffect(() => {
        async function init() {
            const hasTabsPermission = await browser.permissions.contains({ permissions: ['tabs'] });
            setHasTabsPermission(hasTabsPermission);

            if (hasTabsPermission) {
                const initialTabs = await loadTabs();
                setTabs(initialTabs);
                setSelected(initialTabs.map(tab => tab.id));
            }

            const defaultCollection = await storage.get<Collection>("collection");
            onSelectCollection(defaultCollection);
        }

        init();
    }, [loadTabs, onSelectCollection]);

    if (!hasTabsPermission) {
        return (
            <TabContainer>
                <TabPermissionHeader>
                    Permission Required
                </TabPermissionHeader>

                <TabPermissionText>
                    This feature requires permission to access your tabs.
                    Please grant the permission to continue.
                </TabPermissionText>

                <TabPermissionButton
                    onClick={requestTabsPermission}
                >
                    Grant Permission
                </TabPermissionButton>
            </TabContainer>
        )
    }

    function onSelect(id: number) {
        selected.includes(id)
            ? setSelected(selected.filter(i => i !== id))
            : setSelected([...selected, id]);
    }

    return (
        <TabContainer>
            <TabList>
                <TabPermissionHeader>
                    {countText}
                </TabPermissionHeader>

                {tabs.map(tab => (
                    <TabListItem key={tab.id}
                        onClick={() => onSelect(tab.id)}
                    >
                        <TabListItemCheck
                            onClick={() => onSelect(tab.id)}
                        >
                            {selected.includes(tab.id)
                                ? <Checked color={Colors.primary} size={20} />
                                : <Unchecked color={Colors.primary} size={20} />
                            }
                        </TabListItemCheck>

                        <TabListItemInfo>
                            <TabListItemTitle>
                                {tab.title || "Untitled"}
                            </TabListItemTitle>

                            {tab.description
                                ? <TabListItemDescription>
                                    {tab.description}
                                </TabListItemDescription>
                                : null
                            }

                            <TabListItemUrl
                                isSubText={!tab.description}
                            >
                                {subString(tab.url, 50)}
                            </TabListItemUrl>
                        </TabListItemInfo>
                    </TabListItem>
                ))}
            </TabList>

            <TabAddButtonContainer
                $active={selected.length > 0}
            >
                <TabAddButton
                    onClick={onSave}
                    $active={selected.length > 0}
                    onMouseEnter={() => onHover(true)}
                    onMouseLeave={() => onHover(false)}
                >
                    {state.saving
                        ? <>
                            <span style={{ marginRight: 10 }}>Saving</span>
                            <Spinner size={13} />
                        </>
                        : saveToName
                    }
                </TabAddButton>

                <AppDialog
                    minHeight={300}
                    title="Collection"
                    trigger={
                        <TabSelectCollectionButton
                            $hide={state.hovered || state.saving}
                        >
                            {collection
                                ? <SelectCollectionImage
                                    alt={collection.info.name}
                                    src={collection.assets.icon}
                                />
                                : <FcOpenedFolder
                                    size={30}
                                    color={Colors.light}
                                />
                            }
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
    )
}
