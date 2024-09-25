import type { Collection } from "@linkvite/js";
import { sendToBackground } from "@plasmohq/messaging";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoRefresh } from "react-icons/io5";
import type { FindCollectionsResponse } from "~background/messages/collections";
import type {
	CreateCollectionRequest,
	CreateCollectionResponse,
} from "~background/messages/create-collection";
import { AuthInputField } from "~components/auth/styles";
import { Spinner } from "~components/spinner";
import { useTheme } from "~hooks";
import { useDebounceText } from "~hooks/useDebounceText";
import { collectionActions, collectionStore } from "~stores";
import { storage } from "~utils/storage";
import {
	CollectionItem,
	CollectionItemIcon,
	CollectionItemName,
	CollectionItems,
	CollectionsContainer,
	CollectionsContainerHeader,
	CollectionsRefresh,
	CreateCollectionButton,
	EmptyCollectionsText,
	NoCollections,
	RemoveCollection,
} from "./styles";

type Props = {
	collection?: Collection;
	setCollection: (c?: Collection) => void;
};

export function CollectionsModal({ collection, setCollection }: Props) {
	const { theme } = useTheme();
	const [loading, setLoading] = useState(false);
	const [creating, setCreating] = useState(false);
	const [data, setData] = useState<Collection[]>([]);
	const { query, text, setText } = useDebounceText("");

	const filtered = useMemo(() => {
		return data.filter(
			(c) =>
				c.name.toLowerCase().includes(query.toLowerCase()) ||
				c.id === collection?.id,
		);
	}, [data, query, collection]);

	const fetchData = useCallback(async () => {
		setLoading(true);
		const resp = await sendToBackground<null, FindCollectionsResponse>({
			name: "collections",
		});

		"error" in resp
			? toast.error(resp.error)
			: (setData(resp.data), collectionActions.initialize(resp.data));

		setLoading(false);
	}, []);

	const onSelect = useCallback(
		async (c?: Collection) => {
			setCollection(c || null);
			await storage.set("collection", c);
		},
		[setCollection],
	);

	const onCreate = useCallback(async () => {
		if (!text) {
			return;
		}
		setCreating(true);
		const resp = await sendToBackground<
			CreateCollectionRequest,
			CreateCollectionResponse
		>({
			name: "create-collection",
			body: { name: text },
		});

		"error" in resp
			? toast.error(resp.error)
			: (onSelect(resp.data), setText(""), collectionActions.add(resp.data));

		setCreating(false);
	}, [onSelect, setText, text]);

	useEffect(() => {
		async function init() {
			const collections = collectionStore.data.get();
			collections.length ? setData(collections) : fetchData();
		}

		init();
	}, [fetchData]);

	return (
		<CollectionsContainer>
			<CollectionsContainerHeader>
				<AuthInputField
					required
					type="text"
					id="search"
					name="search"
					value={text}
					style={{ margin: 0 }}
					placeholder='eg: "Articles"'
					onChange={(e) => setText(e.target.value)}
				/>

				<CollectionsRefresh onClick={loading ? undefined : fetchData}>
					{loading ? (
						<Spinner color={theme.text} size={18} />
					) : (
						<IoRefresh size={23} style={{ marginRight: -2 }} />
					)}
				</CollectionsRefresh>
			</CollectionsContainerHeader>

			<CollectionItems>
				{collection?.id && !text ? (
					<RemoveCollection onClick={() => onSelect(null)}>
						Remove from {collection.name}
					</RemoveCollection>
				) : null}

				{filtered.length ? (
					<div style={{ marginTop: 15 }}>
						{filtered.map((c) => (
							<Dialog.Close asChild key={c.id}>
								<CollectionItem
									type="button"
									onClick={() => onSelect(c)}
									$current={collection?.id === c.id}
								>
									<CollectionItemIcon
										alt={c.name}
										src={c.icon}
										style={{ width: 35, height: 35, marginRight: 10 }}
									/>

									<CollectionItemName>{c.name}</CollectionItemName>
								</CollectionItem>
							</Dialog.Close>
						))}
					</div>
				) : (
					<NoCollections>
						<EmptyCollectionsText>No collections found</EmptyCollectionsText>

						<CreateCollectionButton onClick={onCreate}>
							{creating ? (
								<Spinner color={theme.text} size={15} />
							) : (
								`Create ${text}`
							)}
						</CreateCollectionButton>
					</NoCollections>
				)}
			</CollectionItems>
		</CollectionsContainer>
	);
}
