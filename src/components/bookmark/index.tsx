import { produce } from "immer";
import { sendToBackground } from "@plasmohq/messaging";
import type { Bookmark, Collection } from "@linkvite/js";
import React, { useCallback, useRef, useState } from "react";
import {
    InputContainer,
    InputField,
    InputFieldLine,
    BookmarkCoverContainer,
    BookmarkCoverMainContainer,
    BookmarkNewImage,
    BookmarkNewImageIcon,
    BookmarkSubmitButton,
    BookmarkSubmitButtonText,
    BookmarkDeleteButton,
    BookmarkActionsContainer,
    BookmarkActionsSubContainer,
    BookmarkAction,
    BookmarkActionIcon,
    SelectCollectionImage,
    BookmarkActionText,
    BookmarkStarIcon,
    ViewBookmarkContainer
} from "./styles";
import { Colors } from "~utils/styles";
import { Spinner } from "~components/spinner";
import { COVER_URL, NIL_OBJECT_ID } from "~utils";
import { HiCamera } from "react-icons/hi2";
import { FaHashtag } from "react-icons/fa6";
import { DropdownMenu } from "~components/primitives/dropdown";
import { browser } from "~browser";
import { AppDialog } from "~components/primitives/dialog";
import { AuthInputField } from "~components/auth/styles";
import * as Dialog from '@radix-ui/react-dialog';
import type {
    UpdateMessageRequest,
    UpdateMessageResponse
} from "~background/messages/update";
import type {
    DeleteMessageRequest,
    DeleteMessageResponse
} from "~background/messages/delete";
import { useTheme } from "~hooks";
import { closeTab } from "~router";
import type {
    UpdateCoverMessageRequest,
    UpdateCoverMessageResponse
} from "~background/messages/cover";
import toast from "react-hot-toast";
import { IoFolderOpen } from "react-icons/io5";
import { TagsModal } from "~components/tags";
import { CollectionsModal } from "~components/collections";
import { storage } from "~utils/storage";
import type {
    FindCollectionRequest,
    FindCollectionResponse
} from "~background/messages/collection";
import { settingStore } from "~stores";
import { TbStar, TbStarFilled } from "react-icons/tb";
import { useEffectOnce, useSelector } from "@legendapp/state/react";

type BookmarkViewProps = {
    tabId: number;
    exists: boolean;
    bookmark: Bookmark;
    hideURL?: boolean;
    disabledImage?: boolean;
    onCreate: () => void;
    updateBookmark: (data: Bookmark) => void;
    updateCoverType?: (type: "default" | "custom") => void;
};

export function BookmarkView({
    tabId,
    exists,
    bookmark,
    hideURL,
    disabledImage,
    onCreate,
    updateBookmark,
    updateCoverType
}: BookmarkViewProps) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [collection, setCollection] = useState<Collection>();
    const { autoClose } = useSelector(settingStore);
    const StarIcon = bookmark.isLiked ? TbStarFilled : TbStar;

    const onToggleLike = useCallback(() => {
        updateBookmark(produce(bookmark, (draft) => {
            draft.isLiked = !draft.isLiked;
        }));
    }, [bookmark, updateBookmark]);

    const onChangeText = useCallback((text: string, key: string) => {
        updateBookmark(produce(bookmark, (draft) => {
            draft.info[key] = text;
        }));
    }, [bookmark, updateBookmark]);

    const onChangeURL = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        updateBookmark(produce(bookmark, (draft) => {
            draft.meta.url = url;
        }));
    }, [bookmark, updateBookmark]);

    const onChangeImage = useCallback(async (src: string, type: "default" | "custom") => {
        updateCoverType?.(type);
        updateBookmark(produce(bookmark, (draft) => {
            draft.assets.thumbnail = src;
        }));

        if (!exists) return;

        setLoading(true);
        const resp = await sendToBackground<UpdateCoverMessageRequest, UpdateCoverMessageResponse>({
            name: "cover",
            body: {
                type,
                cover: src,
                id: bookmark.id,
            }
        });

        if ('error' in resp) {
            toast.error(resp.error);
            setLoading(false);
            return;
        }

        updateBookmark(resp.bookmark);
        setLoading(false);
        toast.success("Cover image updated");
    }, [bookmark, exists, updateBookmark, updateCoverType]);

    const onUpdate = useCallback(async () => {
        if (!bookmark.id || !exists || bookmark.id === NIL_OBJECT_ID) {
            toast.error("Bookmark does not exist");
            return;
        }

        setLoading(true);
        const resp = await sendToBackground<UpdateMessageRequest, UpdateMessageResponse>({
            name: "update",
            body: { bookmark }
        });
        setLoading(false);

        if ('error' in resp) {
            toast.error(resp.error);
            return;
        }

        toast.success(resp.message);

        if (autoClose) {
            closeTab();
        }
    }, [autoClose, bookmark, exists]);

    const onDelete = useCallback(async () => {
        if (!bookmark.id || !exists || bookmark.id === NIL_OBJECT_ID) {
            toast.error("Bookmark does not exist");
            return;
        }

        setDeleting(true);
        const resp = await sendToBackground<DeleteMessageRequest, DeleteMessageResponse>({
            name: "delete",
            body: { id: bookmark.id }
        });
        setDeleting(false);

        if ('error' in resp) {
            toast.error(resp.error);
            return;
        }

        toast.success(resp.message);

        if (autoClose) {
            closeTab();
        }
    }, [autoClose, bookmark.id, exists]);

    const onImageError = useCallback(() => {
        updateBookmark(produce(bookmark, (draft) => {
            draft.assets.thumbnail = COVER_URL;
        }));
    }, [bookmark, updateBookmark]);

    const onSubmit = useCallback(async () => {
        setLoading(true);
        exists
            ? await onUpdate()
            : await onCreate();
        setLoading(false);
    }, [exists, onCreate, onUpdate]);

    const onSelectCollection = useCallback((c?: Collection) => {
        setCollection(c);
        updateBookmark(produce(bookmark, (draft) => {
            draft.info.collection = c?.id || NIL_OBJECT_ID;
        }));
    }, [bookmark, updateBookmark]);

    const fetchCollection = useCallback(async (id: string) => {
        const resp = await sendToBackground<FindCollectionRequest, FindCollectionResponse>({
            name: "collection",
            body: { id }
        });

        if ('error' in resp) {
            toast.error(resp.error);
            return;
        }

        onSelectCollection(resp.data);
    }, [onSelectCollection]);

    useEffectOnce(() => {
        async function init() {
            const hasCollection = bookmark.info.collection !== NIL_OBJECT_ID;
            const defaultCollection = await storage.get<Collection>("collection");
            if (defaultCollection && !hasCollection) {
                onSelectCollection(defaultCollection);
            }

            if (hasCollection) {
                fetchCollection(bookmark.info.collection);
            }
        }

        init();
    });

    return (
        <ViewBookmarkContainer>
            <InputContainer>
                <InputField
                    value={bookmark.info.name}
                    placeholder={'Add a Title'}
                    onChange={(e) => onChangeText(e.target.value, 'name')}
                />

                <InputFieldLine $isName />

                <InputField
                    value={bookmark.info.description}
                    placeholder={'Add a Description'}
                    onChange={(e) => onChangeText(e.target.value, 'description')}
                />
            </InputContainer>

            {hideURL ? null : (
                <InputContainer $isURL>
                    <InputField
                        type="url"
                        onChange={onChangeURL}
                        value={bookmark.meta.url}
                        placeholder={'https://example.com'}
                    />
                </InputContainer>
            )}

            <BookmarkActionsContainer>
                <BookmarkActionsSubContainer $isImage>
                    <BookmarkImageComponent
                        tabId={tabId}
                        onImageError={onImageError}
                        disabledImage={disabledImage}
                        onChangeImage={onChangeImage}
                        cover={bookmark.assets.thumbnail}
                    />
                </BookmarkActionsSubContainer>

                <BookmarkActionsSubContainer>
                    <AppDialog
                        title="Tags"
                        minHeight={200}
                        trigger={
                            <BookmarkAction>
                                <BookmarkActionIcon
                                    bg={Colors.dark_sub}
                                >
                                    <FaHashtag
                                        size={20}
                                        color={Colors.light}
                                    />
                                </BookmarkActionIcon>

                                <BookmarkActionText>
                                    Tags
                                </BookmarkActionText>

                                <BookmarkActionText
                                    style={{ marginLeft: "auto" }}
                                >
                                    {bookmark.tags.length}
                                </BookmarkActionText>
                            </BookmarkAction>
                        }
                    >
                        <TagsModal
                            tags={bookmark.tags}
                            setTags={(tags) => {
                                return updateBookmark(
                                    produce(bookmark, (draft) => {
                                        draft.tags = tags;
                                    })
                                )
                            }}
                        />
                    </AppDialog>
                    <AppDialog
                        minHeight={300}
                        title="Collection"
                        trigger={
                            <BookmarkAction>
                                {collection
                                    ? <SelectCollectionImage
                                        alt={collection.info.name}
                                        src={collection.assets.icon}
                                    />
                                    : <BookmarkActionIcon
                                        bg={Colors.orange}
                                    >
                                        <IoFolderOpen
                                            size={20}
                                            color={Colors.light}
                                        />
                                    </BookmarkActionIcon>
                                }

                                <BookmarkActionText>
                                    {collection
                                        ? collection.info.name
                                        : "Add to Collection"
                                    }
                                </BookmarkActionText>
                            </BookmarkAction>
                        }
                    >
                        <CollectionsModal
                            collection={collection}
                            setCollection={onSelectCollection}
                        />
                    </AppDialog>

                    <BookmarkStarIcon
                        onClick={onToggleLike}
                    >
                        <StarIcon
                            size={21}
                            color={bookmark.isLiked
                                ? Colors.warning
                                : theme.text_sub
                            }
                        />
                    </BookmarkStarIcon>
                </BookmarkActionsSubContainer>
            </BookmarkActionsContainer>

            <BookmarkSubmitButton
                onClick={onSubmit}
                disabled={loading || deleting}
            >
                {loading
                    ? <Spinner color={Colors.light} />
                    : <BookmarkSubmitButtonText>
                        {exists ? "Update" : "Save"}
                    </BookmarkSubmitButtonText>
                }
            </BookmarkSubmitButton>

            {exists && (
                <BookmarkDeleteButton
                    onClick={onDelete}
                    disabled={deleting || loading}
                >
                    {deleting
                        ? <Spinner color={theme.text} size={15} />
                        : "Delete"
                    }
                </BookmarkDeleteButton>
            )}
        </ViewBookmarkContainer>
    )
}

type BookmarkImageComponentProps = {
    tabId: number;
    cover: string;
    disabledImage?: boolean;
    onImageError: () => void;
    onChangeImage: (src: string, type: "default" | "custom") => void;
};

function BookmarkImageComponent({ tabId, cover, disabledImage, onImageError, onChangeImage }: BookmarkImageComponentProps) {
    const [coverURL, setCoverURL] = useState("");
    const linkRef = useRef<HTMLButtonElement>(null);
    const mediaRef = useRef<HTMLInputElement>(null);

    type Option = {
        label: string;
        value: string;
    };

    const options: Option[] = [
        { label: "Link", value: "link" },
        { label: "Upload", value: "upload" },
        { label: "Screenshot", value: "screenshot" },
        { label: "Reset", value: "reset" },
    ];

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            onChangeImage(reader.result as string, "custom");
        }, false);

        reader.readAsDataURL(file);
    }, [onChangeImage]);

    const handleLinkChange = useCallback(() => {
        onChangeImage(coverURL, "default");
    }, [coverURL, onChangeImage]);

    const handleLinkClick = useCallback(() => {
        linkRef.current?.click();
    }, []);

    const handleUploadClick = useCallback(() => {
        mediaRef.current?.click();
    }, []);

    const handleScreenshot = useCallback(async () => {
        const tab = await browser.tabs.get(tabId);
        if (!tab) return;

        const image = await browser.tabs.captureVisibleTab(tab.windowId, { format: "png" });
        onChangeImage(image, "custom");
    }, [onChangeImage, tabId]);

    const handleReset = useCallback(() => {
        onChangeImage(COVER_URL, "default");
    }, [onChangeImage]);

    const handleMenuClick = useCallback((value: Option["value"]) => {
        switch (value) {
            case "link":
                handleLinkClick();
                break;
            case "upload":
                handleUploadClick();
                break;
            case "screenshot":
                handleScreenshot();
                break;
            case "reset":
                handleReset();
                break;
        }
    }, [handleLinkClick, handleUploadClick, handleScreenshot, handleReset]);

    return (
        <BookmarkCoverMainContainer>
            <BookmarkCoverContainer>
                <BookmarkNewImage
                    src={cover}
                    alt={"Cover Image"}
                    onError={onImageError}
                    crossOrigin="use-credentials"
                />

                <BookmarkNewImageIcon>
                    <DropdownMenu.Root
                        disabled={disabledImage}
                        trigger={
                            <HiCamera
                                size={24}
                                color={Colors.light}
                                style={{ opacity: 0.7 }}
                            />
                        }
                    >
                        {options.map((option) => (
                            <DropdownMenu.Item
                                key={option.value}
                                onClick={() => handleMenuClick(option.value)}
                            >
                                {option.label}
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Root>
                </BookmarkNewImageIcon>
            </BookmarkCoverContainer>

            <input
                type="file"
                ref={mediaRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
            />

            <AppDialog
                title="Cover Image"
                description="Enter an image link to use as the cover image"
                trigger={
                    <button
                        ref={linkRef}
                        onChange={handleLinkClick}
                        style={{ display: 'none' }}
                    />
                }
            >
                <AuthInputField
                    required
                    type='text'
                    id='cover'
                    name='cover'
                    placeholder='john_doe'
                    value={coverURL}
                    style={{ marginTop: 5 }}
                    onChange={(e) => setCoverURL(e.target.value)}
                />

                <Dialog.Close asChild>
                    <BookmarkSubmitButton
                        disabled={!coverURL}
                        style={{ marginTop: 10 }}
                        onClick={handleLinkChange}
                    >
                        <BookmarkSubmitButtonText>
                            Save
                        </BookmarkSubmitButtonText>
                    </BookmarkSubmitButton>
                </Dialog.Close>
            </AppDialog>
        </BookmarkCoverMainContainer>
    )
}
