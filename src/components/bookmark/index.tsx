import { produce } from "immer";
import type { Bookmark } from "@linkvite/js";
import { sendToBackground } from "@plasmohq/messaging";
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
    BookmarkDeleteButton
} from "./styles";
import { Colors } from "~utils/styles";
import { Spinner } from "~components/spinner";
import { NIL_OBJECT_ID } from "~utils";
import { HiCamera } from "react-icons/hi2";
import { DropdownMenu } from "~components/primitives/dropdown";
import { browser } from "~browser";
import { AppDialog } from "~components/primitives/dialog";
import { AuthInputField } from "~components/auth/styles";
import * as Dialog from '@radix-ui/react-dialog';
import type {
    CreateMessageRequest,
    CreateMessageResponse
} from "~background/messages/create";
import type { CreateBookmarkProps } from "~api";
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

type BookmarkViewProps = {
    tabId: number;
    exists: boolean;
    bookmark: Bookmark;
    defaultImage: string;
    setBookmark: React.Dispatch<React.SetStateAction<Bookmark>>;
};

export function BookmarkView({ tabId, exists, defaultImage, bookmark, setBookmark }: BookmarkViewProps) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [coverType, setCoverType] = useState<"default" | "custom">("default");

    const onChangeText = useCallback((text: string, key: string) => {
        setBookmark(prev => {
            return produce(prev, (draft) => {
                draft.info[key] = text;
            });
        })
    }, [setBookmark]);

    const onChangeURL = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setBookmark(prev => {
            return produce(prev, (draft) => {
                draft.meta.url = url;
            });
        });
    }, [setBookmark]);

    const onChangeImage = useCallback(async (src: string, type: "default" | "custom") => {
        setCoverType(type);
        setBookmark(prev => {
            return produce(prev, (draft) => {
                draft.assets.thumbnail = src;
            });
        });

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

        const updated = resp.bookmark;
        setBookmark(() => updated);
        setLoading(false);
        toast.success("Cover image updated");
    }, [bookmark.id, exists, setBookmark]);

    const onCreate = useCallback(async () => {
        const data: CreateBookmarkProps = {
            coverType,
            url: bookmark.meta.url,
            title: bookmark.info.name,
            description: bookmark.info.description,
            tags: bookmark.tags,
            favicon: bookmark.assets.icon,
            cover: bookmark.assets.thumbnail,
            collection: bookmark.info.collection,
        }

        const resp = await sendToBackground<CreateMessageRequest, CreateMessageResponse>({
            name: "create",
            body: { data }
        });

        if ('error' in resp) {
            toast.error(resp.error);
            return;
        }

        toast.success(resp.message);
        closeTab();
    }, [bookmark, coverType]);

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
        closeTab();
    }, [bookmark, exists]);

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
        closeTab();
    }, [bookmark, exists]);

    const onImageError = useCallback(() => {
        setBookmark(prev => {
            return produce(prev, (draft) => {
                draft.assets.thumbnail = defaultImage;
            });
        });
    }, [defaultImage, setBookmark]);

    const onSubmit = useCallback(async () => {
        setLoading(true);
        exists
            ? await onUpdate()
            : await onCreate();
        setLoading(false);
    }, [onCreate, onUpdate, exists]);

    return (
        <React.Fragment>
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

            <InputContainer $isURL>
                <InputField
                    type="url"
                    onChange={onChangeURL}
                    value={bookmark.meta.url}
                    placeholder={'https://example.com'}
                />
            </InputContainer>

            <BookmarkImageComponent
                tabId={tabId}
                onImageError={onImageError}
                defaultImage={defaultImage}
                onChangeImage={onChangeImage}
                cover={bookmark.assets.thumbnail}
            />

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
        </React.Fragment>
    )
}

type BookmarkImageComponentProps = {
    tabId: number;
    cover: string;
    disabled?: boolean;
    defaultImage: string;
    onImageError: () => void;
    onChangeImage: (src: string, type: "default" | "custom") => void;
};

export function BookmarkImageComponent({ disabled, tabId, cover, defaultImage, onImageError, onChangeImage }: BookmarkImageComponentProps) {
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
        onChangeImage(defaultImage, "default");
    }, [defaultImage, onChangeImage]);

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
                />

                {disabled ? null : (
                    <BookmarkNewImageIcon>
                        <DropdownMenu.Root
                            trigger={
                                <HiCamera size={24} color={Colors.light} />
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
                )}
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
