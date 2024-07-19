import { useEffectOnce, useSelector } from "@legendapp/state/react";
import type { Bookmark, Collection } from "@linkvite/js";
import { sendToBackground } from "@plasmohq/messaging";
import * as Dialog from "@radix-ui/react-dialog";
import { produce } from "immer";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaHashtag } from "react-icons/fa6";
import { HiCamera } from "react-icons/hi2";
import { IoFolderOpen } from "react-icons/io5";
import { TbStar, TbStarFilled } from "react-icons/tb";
import type {
	FindCollectionRequest,
	FindCollectionResponse,
} from "~background/messages/collection";
import type {
	UpdateCoverMessageRequest,
	UpdateCoverMessageResponse,
} from "~background/messages/cover";
import type {
	DeleteMessageRequest,
	DeleteMessageResponse,
} from "~background/messages/delete";
import type {
	UpdateMessageRequest,
	UpdateMessageResponse,
} from "~background/messages/update";
import { browser } from "~browser";
import { AuthInputField } from "~components/auth/styles";
import { CollectionsModal } from "~components/collections";
import { AppDialog } from "~components/primitives/dialog";
import { DropdownMenu } from "~components/primitives/dropdown";
import { Spinner } from "~components/spinner";
import { TagsModal } from "~components/tags";
import { useTheme } from "~hooks";
import { closeTab } from "~router";
import { settingStore } from "~stores";
import { COVER_URL, convertToTags } from "~utils";
import { storage } from "~utils/storage";
import { Colors } from "~utils/styles";
import {
	BookmarkAction,
	BookmarkActionIcon,
	BookmarkActionText,
	BookmarkActionsContainer,
	BookmarkActionsSubContainer,
	BookmarkCoverContainer,
	BookmarkCoverMainContainer,
	BookmarkDeleteButton,
	BookmarkNewImage,
	BookmarkNewImageIcon,
	BookmarkStarIcon,
	BookmarkSubmitButton,
	BookmarkSubmitButtonText,
	InputContainer,
	InputField,
	InputFieldLine,
	SelectCollectionImage,
	ViewBookmarkContainer,
} from "./styles";

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
	updateCoverType,
}: BookmarkViewProps) {
	const { theme } = useTheme();
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [collection, setCollection] = useState<Collection>();
	const { autoClose } = useSelector(settingStore);
	const StarIcon = bookmark.starred ? TbStarFilled : TbStar;

	const onToggleStar = useCallback(() => {
		updateBookmark(
			produce(bookmark, (draft) => {
				draft.starred = !draft.starred;
			}),
		);
	}, [bookmark, updateBookmark]);

	const onChangeText = useCallback(
		(text: string, key: string) => {
			updateBookmark(
				produce(bookmark, (draft) => {
					draft[key] = text;
				}),
			);
		},
		[bookmark, updateBookmark],
	);

	const onChangeURL = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const url = e.target.value;
			updateBookmark(
				produce(bookmark, (draft) => {
					draft.url = url;
				}),
			);
		},
		[bookmark, updateBookmark],
	);

	const onChangeImage = useCallback(
		async (src: string, type: "default" | "custom") => {
			updateCoverType?.(type);
			updateBookmark(
				produce(bookmark, (draft) => {
					draft.thumbnail = src;
				}),
			);

			if (!exists) {
				return;
			}

			setLoading(true);
			const resp = await sendToBackground<
				UpdateCoverMessageRequest,
				UpdateCoverMessageResponse
			>({
				name: "cover",
				body: {
					type,
					cover: src,
					id: bookmark.id,
				},
			});

			if ("error" in resp) {
				toast.error(resp.error);
				setLoading(false);
				return;
			}

			updateBookmark(resp.bookmark);
			setLoading(false);
			toast.success("Cover image updated");
		},
		[bookmark, exists, updateBookmark, updateCoverType],
	);

	const onUpdate = useCallback(async () => {
		if (!bookmark.id || !exists) {
			toast.error("Bookmark does not exist");
			return;
		}

		setLoading(true);
		const resp = await sendToBackground<
			UpdateMessageRequest,
			UpdateMessageResponse
		>({
			name: "update",
			body: { bookmark },
		});
		setLoading(false);

		if ("error" in resp) {
			toast.error(resp.error);
			return;
		}

		toast.success(resp.message);

		if (autoClose) {
			closeTab();
		}
	}, [autoClose, bookmark, exists]);

	const onDelete = useCallback(async () => {
		if (!bookmark.id || !exists) {
			toast.error("Bookmark does not exist");
			return;
		}

		setDeleting(true);
		const resp = await sendToBackground<
			DeleteMessageRequest,
			DeleteMessageResponse
		>({
			name: "delete",
			body: { id: bookmark.id },
		});
		setDeleting(false);

		if ("error" in resp) {
			toast.error(resp.error);
			return;
		}

		toast.success(resp.message);

		if (autoClose) {
			closeTab();
		}
	}, [autoClose, bookmark.id, exists]);

	const onImageError = useCallback(() => {
		updateBookmark(
			produce(bookmark, (draft) => {
				draft.thumbnail = COVER_URL;
			}),
		);
	}, [bookmark, updateBookmark]);

	const onSubmit = useCallback(async () => {
		setLoading(true);
		exists ? await onUpdate() : await onCreate();
		setLoading(false);
	}, [exists, onCreate, onUpdate]);

	const onSelectCollection = useCallback(
		(c?: Collection) => {
			setCollection(c);
			updateBookmark(
				produce(bookmark, (draft) => {
					draft.collection_id = c?.id || null;
				}),
			);
		},
		[bookmark, updateBookmark],
	);

	const fetchCollection = useCallback(
		async (id: string) => {
			const resp = await sendToBackground<
				FindCollectionRequest,
				FindCollectionResponse
			>({
				name: "collection",
				body: { id },
			});

			if ("error" in resp) {
				toast.error(resp.error);
				return;
			}

			onSelectCollection(resp.data);
		},
		[onSelectCollection],
	);

	useEffectOnce(() => {
		async function init() {
			const hasCollection = bookmark.collection_id !== null;
			const defaultCollection = await storage.get<Collection>("collection");
			if (defaultCollection && !hasCollection) {
				onSelectCollection(defaultCollection);
			}

			if (hasCollection) {
				fetchCollection(bookmark.collection_id);
			}
		}

		init();
	});

	return (
		<ViewBookmarkContainer>
			<InputContainer>
				<InputField
					value={bookmark.title}
					placeholder={"Add a Title"}
					onChange={(e) => onChangeText(e.target.value, "title")}
				/>

				<InputFieldLine $isName />

				<InputField
					value={bookmark.description}
					placeholder={"Add a Description"}
					onChange={(e) => onChangeText(e.target.value, "description")}
				/>
			</InputContainer>

			{hideURL ? null : (
				<InputContainer $isURL>
					<InputField
						type="url"
						onChange={onChangeURL}
						value={bookmark.url}
						placeholder={"https://example.com"}
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
						cover={bookmark.thumbnail}
					/>
				</BookmarkActionsSubContainer>

				<BookmarkActionsSubContainer>
					<AppDialog
						title="Tags"
						minHeight={200}
						trigger={
							<BookmarkAction>
								<BookmarkActionIcon bg={Colors.dark_sub}>
									<FaHashtag size={20} color={Colors.light} />
								</BookmarkActionIcon>

								<BookmarkActionText>Tags</BookmarkActionText>

								<BookmarkActionText style={{ marginLeft: "auto" }}>
									{convertToTags(bookmark.tags).length}
								</BookmarkActionText>
							</BookmarkAction>
						}
					>
						<TagsModal
							tags={bookmark.tags}
							setTags={(tags) => {
								return updateBookmark(
									produce(bookmark, (draft) => {
										draft.tags = tags.join(",");
									}),
								);
							}}
						/>
					</AppDialog>
					<AppDialog
						minHeight={300}
						title="Collection"
						trigger={
							<BookmarkAction>
								{collection ? (
									<SelectCollectionImage
										alt={collection.name}
										src={collection.icon}
									/>
								) : (
									<BookmarkActionIcon bg={Colors.orange}>
										<IoFolderOpen size={20} color={Colors.light} />
									</BookmarkActionIcon>
								)}

								<BookmarkActionText>
									{collection ? collection.name : "Add to Collection"}
								</BookmarkActionText>
							</BookmarkAction>
						}
					>
						<CollectionsModal
							collection={collection}
							setCollection={onSelectCollection}
						/>
					</AppDialog>

					<BookmarkStarIcon onClick={onToggleStar}>
						<StarIcon
							size={21}
							color={bookmark.starred ? Colors.warning : theme.text_sub}
						/>
					</BookmarkStarIcon>
				</BookmarkActionsSubContainer>
			</BookmarkActionsContainer>

			<BookmarkSubmitButton onClick={onSubmit} disabled={loading || deleting}>
				{loading ? (
					<Spinner color={Colors.light} />
				) : (
					<BookmarkSubmitButtonText>
						{exists ? "Update" : "Save"}
					</BookmarkSubmitButtonText>
				)}
			</BookmarkSubmitButton>

			{exists && (
				<BookmarkDeleteButton onClick={onDelete} disabled={deleting || loading}>
					{deleting ? <Spinner color={theme.text} size={15} /> : "Delete"}
				</BookmarkDeleteButton>
			)}
		</ViewBookmarkContainer>
	);
}

type BookmarkImageComponentProps = {
	tabId: number;
	cover: string;
	disabledImage?: boolean;
	onImageError: () => void;
	onChangeImage: (src: string, type: "default" | "custom") => void;
};

function BookmarkImageComponent({
	tabId,
	cover,
	disabledImage,
	onImageError,
	onChangeImage,
}: BookmarkImageComponentProps) {
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

	const handleImageUpload = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			const reader = new FileReader();
			reader.addEventListener(
				"load",
				() => {
					onChangeImage(reader.result as string, "custom");
				},
				false,
			);

			reader.readAsDataURL(file);
		},
		[onChangeImage],
	);

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
		if (!tab) {
			return;
		}

		const image = await browser.tabs.captureVisibleTab(tab.windowId, {
			format: "png",
		});
		onChangeImage(image, "custom");
	}, [onChangeImage, tabId]);

	const handleReset = useCallback(() => {
		onChangeImage(COVER_URL, "default");
	}, [onChangeImage]);

	const handleMenuClick = useCallback(
		(value: Option["value"]) => {
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
		},
		[handleLinkClick, handleUploadClick, handleScreenshot, handleReset],
	);

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
				style={{ display: "none" }}
				onChange={handleImageUpload}
			/>

			<AppDialog
				title="Cover Image"
				description="Enter an image link to use as the cover image"
				trigger={
					<button
						ref={linkRef}
						onChange={handleLinkClick}
						style={{ display: "none" }}
					/>
				}
			>
				<AuthInputField
					required
					type="text"
					id="cover"
					name="cover"
					placeholder="john_doe"
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
						<BookmarkSubmitButtonText>Save</BookmarkSubmitButtonText>
					</BookmarkSubmitButton>
				</Dialog.Close>
			</AppDialog>
		</BookmarkCoverMainContainer>
	);
}
