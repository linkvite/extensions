
import { Colors } from "~utils/styles";
import { storage } from "~utils/storage";
import { IoMdClose } from "react-icons/io";
import { AppText } from "~components/text";
import React, { useEffect, useMemo, useState } from "react";
import {
    RecentTags,
    RecentTagsClear,
    RecentTagsHeader,
    TagAddButton,
    TagItem,
    TagItemCloseButton,
    TagItems,
    TagsContainer,
    TagsInput,
    TagsInputContainer
} from "./styles";

type Props = {
    tags: string[];
    setTags: (tags: string[]) => void;
}

export function TagsModal({ tags, setTags }: Props) {
    const [tag, setTag] = useState("");
    const [currentTag, setCurrentTag] = useState("");
    const [recent, setRecent] = useState<string[]>([]);

    const uniqueTags = useMemo(() => Array.from(new Set(tags)), [tags]);

    useEffect(() => {
        async function init() {
            const tags = (await storage
                .get<string[]>("recentTags") ?? [])
                .slice(0, 5);
            if (tags) setRecent(tags);
        }

        init();
    }, []);

    function onRemoveTag(tag: string) {
        if (!tag) return;
        const newTags = uniqueTags.filter((t) => t !== tag);
        setTags(newTags);
    }

    function onPressTag(tag: string) {
        if (!tag) return;

        const newTag = tag.trim().replace(/\s/g, '');
        const unique = new Set([...uniqueTags, ...newTag.split(',')]);

        setTags(Array.from(unique));
        setCurrentTag(currentTag === tag ? "" : tag);

        setTag("");

        addToRecent(newTag);
    }

    async function addToRecent(tag: string) {
        if (!tag || recent.includes(tag)) return;

        const oldRecent = (await storage
            .get<string[]>("recentTags") ?? [])
            .slice(0, 4);
        const newRecent = Array.from(new Set([tag, ...oldRecent]))

        setRecent(newRecent);
        await storage.set("recentTags", newRecent);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!tag) return;

        onPressTag(tag);
    }

    async function clearRecentTags() {
        setRecent([]);
        await storage.remove("recentTags");
    }

    return (
        <TagsContainer onSubmit={onSubmit}>
            <TagsInputContainer>
                <TagsInput
                    required
                    type='text'
                    id='tag'
                    name='tag'
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder='eg: "Books" or "Read, Books" for multiple tags'
                />

                <TagAddButton
                    type='submit'
                    $active={!!tag}
                    aria-disabled={!tag}
                >
                    Add
                </TagAddButton>
            </TagsInputContainer>

            <TagItems>
                {tags.length ? tags.map((tag) => (
                    <Tag
                        key={tag}
                        tag={tag}
                        currentTag={currentTag}
                        onRemoveTag={onRemoveTag}
                        onPressTag={setCurrentTag}
                    />
                )) : (
                    <AppText
                        $isSubText
                        fontSize="xxs"
                        topSpacing="md"
                        width="100%"
                        maxWidth="100%"
                        textAlign="center"
                    >
                        No tags added yet
                    </AppText>
                )}
            </TagItems>

            {recent.length ? (
                <RecentTags>
                    <RecentTagsHeader>
                        <AppText
                            $isSubText
                            fontSize="xxs"
                        >
                            Recent tags
                        </AppText>

                        <RecentTagsClear
                            type="button"
                            onClick={clearRecentTags}
                        >
                            Clear
                        </RecentTagsClear>
                    </RecentTagsHeader>

                    <TagItems style={{ marginTop: 5 }}>
                        {recent.map((tag) => (
                            <Tag
                                key={tag}
                                tag={tag}
                                onPressTag={onPressTag}
                            />
                        ))}
                    </TagItems>
                </RecentTags>
            ) : null}
        </TagsContainer>
    )
}

type TagItemProps = {
    tag: string;
    currentTag?: string;
    onPressTag: (tag: string) => void;
    onRemoveTag?: (tag: string) => void;
}

function Tag({ tag, currentTag, onPressTag, onRemoveTag }: TagItemProps) {
    const [closeHovered, setCloseHovered] = useState(false);

    return (
        <React.Fragment>
            <TagItem
                type="button"
                $closeHovered={closeHovered}
                onClick={() => onPressTag(tag)}
            >
                <AppText
                    color="light"
                    fontSize="xxs"
                >
                    {tag}
                </AppText>

                {currentTag && currentTag === tag
                    ? <TagItemCloseButton
                        role="button"
                        aria-label="remove tag"
                        tabIndex={0}
                        onClick={() => onRemoveTag?.(tag)}
                        onMouseEnter={() => setCloseHovered(true)}
                        onMouseLeave={() => setCloseHovered(false)}
                    >
                        <IoMdClose
                            size={14}
                            name="ios-close"
                            color={Colors.light}
                        />
                    </TagItemCloseButton>
                    : null
                }
            </TagItem>
        </React.Fragment>
    )
}