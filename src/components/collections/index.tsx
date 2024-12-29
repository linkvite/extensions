import { useSelector } from "@legendapp/state/react";
import type { Collection } from "@linkvite/js";
import { sendToBackground } from "@plasmohq/messaging";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import toast from "react-hot-toast";
import type {
	FindCollectionsRequest,
	FindCollectionsResponse,
} from "~background/messages/collections";
import type {
	CreateCollectionRequest,
	CreateCollectionResponse,
} from "~background/messages/create-collection";
import { AuthInputField } from "~components/auth/styles";
import { Spinner } from "~components/spinner";
import { useTheme } from "~hooks";
import { useDebounceText } from "~hooks/useDebounceText";
import { userStore } from "~stores";
import { storage } from "~utils/storage";
import {
	CollectionItem,
	CollectionItemIcon,
	CollectionItemName,
	CollectionItems,
	CollectionMineOnly,
	CollectionMineOnlyInput,
	CollectionMineOnlyLabel,
	CollectionsContainer,
	CollectionsContainerHeader,
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
	const onEndReachedThreshold = 0;
	const { id: uID } = useSelector(userStore);
	const [loading, setLoading] = useState(false);
	const [creating, setCreating] = useState(false);
	const [data, setData] = useState<Collection[]>([]);
	const { query, text, setText } = useDebounceText("");
	const [params, setParams] = useState({
		limit: 10,
		mineOnly: true,
	});

	function onEndReached() {
		setParams((prev) => ({ ...prev, limit: prev.limit + 10 }));
	}

	function onScroll(event: React.UIEvent<HTMLDivElement, UIEvent>) {
		const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

		if (scrollHeight - scrollTop - clientHeight <= onEndReachedThreshold) {
			onEndReached();
		}
	}

	const fetchData = useCallback(async () => {
		if (!query) {
			return;
		}
		setLoading(true);
		const resp = await sendToBackground<
			FindCollectionsRequest,
			FindCollectionsResponse
		>({
			name: "collections",
			body: {
				query,
				limit: params.limit,
				owner: params.mineOnly ? uID : undefined,
			},
		});

		"error" in resp ? toast.error(resp.error) : setData(resp.data);

		setLoading(false);
	}, [query, params.limit, params.mineOnly, uID]);

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
			: (onSelect(resp.data), setText(""));

		setCreating(false);
	}, [onSelect, setText, text]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: This is needed to fetch data on every query change.
	useEffect(() => {
		fetchData();
	}, [fetchData, query, params.limit, params.mineOnly]);

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
			</CollectionsContainerHeader>

			<CollectionItems onScroll={onScroll}>
				{collection?.id && !text ? (
					<RemoveCollection onClick={() => onSelect(null)}>
						Remove from {collection.name}
					</RemoveCollection>
				) : null}

				{loading ? (
					<div style={{ marginTop: 15 }}>
						<Spinner color={theme.text} />
					</div>
				) : !text ? (
					<EmptyCollectionsText>
						Start typing to search for collections
					</EmptyCollectionsText>
				) : !data.length ? (
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
				) : null}

				{text && data.length ? (
					<React.Fragment>
						<CollectionMineOnly>
							<CollectionMineOnlyLabel htmlFor="mineOnly">
								Mine only
							</CollectionMineOnlyLabel>
							<CollectionMineOnlyInput
								type="checkbox"
								id="mineOnly"
								name="mineOnly"
								checked={params.mineOnly}
								onChange={(e) =>
									setParams((prev) => ({ ...prev, mineOnly: e.target.checked }))
								}
							/>
						</CollectionMineOnly>
						{data.map((c) => (
							<Dialog.Close asChild key={c.id}>
								<CollectionItem
									type="button"
									onClick={() => onSelect(c)}
									$current={collection?.id === c.id}
								>
									<CollectionItemIcon
										alt={c?.name}
										src={c?.icon}
										style={{ width: 35, height: 35, marginRight: 10 }}
									/>

									<CollectionItemName>{c.name}</CollectionItemName>
								</CollectionItem>
							</Dialog.Close>
						))}
					</React.Fragment>
				) : null}
			</CollectionItems>
		</CollectionsContainer>
	);
}
