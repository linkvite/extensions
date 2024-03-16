import toast from "react-hot-toast";
import type { Collection } from "@linkvite/js";
import { useDebounceText } from "~hooks/useDebounceText";
import { AuthInputField } from "~components/auth/styles";
import { sendToBackground } from "@plasmohq/messaging";
import React, { useCallback, useEffect, useState } from "react";
import type {
    FindCollectionsRequest,
    FindCollectionsResponse
} from "~background/messages/collections";
import {
    CollectionItem,
    CollectionItems,
    CollectionsContainer,
    EmptyCollectionsText,
    CollectionItemIcon,
    CollectionItemName,
    CollectionMineOnly,
    CollectionMineOnlyLabel,
    CollectionMineOnlyInput
} from "./styles";
import { useSelector } from "@legendapp/state/react";
import { userStore } from "~stores";
import * as Dialog from "@radix-ui/react-dialog";

type Props = {
    collection?: Collection
    setCollection: (c: Collection) => void;
}

export function CollectionsModal({ collection, setCollection }: Props) {
    const onEndReachedThreshold = 0;
    const { id: uID } = useSelector(userStore);
    const [data, setData] = useState<Collection[]>([]);
    const { query, text, setText } = useDebounceText('');
    const [params, setParams] = useState({
        limit: 10,
        mineOnly: true
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
        if (!query) return;
        const resp = await sendToBackground<FindCollectionsRequest, FindCollectionsResponse>({
            name: "collections",
            body: {
                query,
                limit: params.limit,
                owner: params.mineOnly ? uID : undefined
            }
        });

        if ('error' in resp) {
            toast.error(resp.error);
            return;
        }

        setData(resp.data);
    }, [query, params.limit, params.mineOnly, uID]);

    useEffect(() => {
        fetchData();
    }, [fetchData, query, params.limit, params.mineOnly]);

    return (
        <CollectionsContainer>
            <AuthInputField
                required
                type='text'
                id='search'
                name='search'
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='eg: "Articles"'
                style={{ margin: 0 }}
            />

            <CollectionItems
                onScroll={onScroll}
            >
                {!text ? (
                    <EmptyCollectionsText>Start typing to search for collections</EmptyCollectionsText>
                ) : !data.length ? (
                    <EmptyCollectionsText>No collections found</EmptyCollectionsText>
                ) : (
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
                                onChange={(e) => setParams((prev) => ({ ...prev, mineOnly: e.target.checked }))}
                            />
                        </CollectionMineOnly>
                        {data.map((c) => (
                            <Dialog.Close asChild key={c.id}>
                                <CollectionItem
                                    type="button"
                                    onClick={() => setCollection(c)}
                                    $current={collection?.id === c.id}
                                >
                                    <CollectionItemIcon
                                        alt={c?.info.name}
                                        src={c?.assets?.icon}
                                        style={{ width: 35, height: 35, marginRight: 10 }}
                                    />

                                    <CollectionItemName>
                                        {c.info.name}
                                    </CollectionItemName>
                                </CollectionItem>
                            </Dialog.Close>
                        ))}
                    </React.Fragment>
                )}
            </CollectionItems>
        </CollectionsContainer>
    )
}
