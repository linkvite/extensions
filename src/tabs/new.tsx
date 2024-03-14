import { type Bookmark, type ParsedLinkData } from "@linkvite/js";
import { sendToBackground } from "@plasmohq/messaging";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
    ExistsMessageRequest,
    ExistsMessageResponse
} from "~background/messages/exists";
import type {
    ParseMessageRequest,
    ParseMessageResponse
} from "~background/messages/parse";
import { PageProvider } from "~components/wrapper";
import { PageContainer } from "./styles";
import { BookmarkImageComponent, BookmarkView } from "~components/bookmark";
import { COVER_URL } from "~utils";
import { Spinner } from "~components/spinner";
import { InputContainer, InputField, InputFieldLine, BookmarkSubmitButton, BookmarkSubmitButtonText } from "~components/bookmark/styles";
import { Colors } from "~utils/styles";
import toast from "react-hot-toast";

type LinkType = "link" | "image";

function NewItemPage() {
    const params = useMemo(() => new URL(window.location.href), []);
    const url = decodeURIComponent(params.searchParams.get('url') || '');
    const tabId = decodeURIComponent(params.searchParams.get('tabId') || '');
    const type = decodeURIComponent(params.searchParams.get('type') || '') as LinkType;

    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [collection, setCollection] = useState("");
    const [data, setData] = useState<ParsedLinkData>();
    const [bookmark, setBookmark] = useState<Bookmark>();
    const [media, setMedia] = useState({
        title: "",
        starred: false,
        description: "",
        tags: [] as string[],
        source: type === "image" ? url : "",
    });

    const checkExists = useCallback(async (url: string) => {
        const resp = await sendToBackground<ExistsMessageRequest, ExistsMessageResponse>({
            name: "exists",
            body: { url }
        });

        if (resp.exists) {
            setExists(true);
            setBookmark(resp.bookmark);
        }

        return resp.exists;
    }, []);

    const fetchFromAPI = useCallback(async (url: string) => {
        try {
            const resp = await sendToBackground<ParseMessageRequest, ParseMessageResponse>({
                name: "parse",
                body: { url }
            });

            if (resp.data) {
                setData(resp.data);
            }
        } catch (error) {
            console.error("Error extracting HTML: ", error);
            toast.error("Error extracting HTML");
        }
    }, []);

    useEffect(() => {
        async function init() {
            setLoading(true);
            const exists = await checkExists(url);
            if (exists) {
                setLoading(false);
                return;
            }

            await fetchFromAPI(url);
            setLoading(false);
        }

        if (type === "link") {
            init();
        }
    }, [checkExists, fetchFromAPI, type, url]);

    if (loading) {
        return (
            <PageProvider>
                <PageContainer>
                    <Spinner />
                </PageContainer>
            </PageProvider>
        )
    }

    if (type === "link" && exists && bookmark) {
        return (
            <PageContainer>
                <PageProvider>
                    <BookmarkView
                        exists={exists}
                        bookmark={bookmark}
                        tabId={Number(tabId)}
                        defaultImage={COVER_URL}
                        setBookmark={setBookmark}
                    />
                </PageProvider>
            </PageContainer>
        )
    }

    if (type === "link" && !exists && data) {
        return (
            <PageContainer>
                <PageProvider>
                    <InputContainer>
                        <InputField
                            value={data.name}
                            placeholder={'Add a Title'}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />

                        <InputFieldLine $isName />

                        <InputField
                            value={data.description}
                            placeholder={'Add a Description'}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                        />
                    </InputContainer>

                    <InputContainer $isURL>
                        <InputField
                            type="url"
                            value={url}
                            placeholder={'https://example.com'}
                            onChange={(e) => setData({ ...data, url: e.target.value })}
                        />
                    </InputContainer>

                    <BookmarkImageComponent
                        tabId={Number(tabId)}
                        defaultImage={COVER_URL}
                        cover={data.image || COVER_URL}
                        onChangeImage={(image) => setData({ ...data, image })}
                    />

                    <BookmarkSubmitButton
                    // onClick={onSubmit}
                    // disabled={loading || deleting}
                    >
                        {loading
                            ? <Spinner color={Colors.light} />
                            : <BookmarkSubmitButtonText>
                                Save
                            </BookmarkSubmitButtonText>
                        }
                    </BookmarkSubmitButton>
                </PageProvider>
            </PageContainer>
        )
    }

    if (type === "image") {
        return (
            <PageContainer>
                <PageProvider>
                    <InputContainer>
                        <InputField
                            value={media.title}
                            placeholder={'Add a Title'}
                            onChange={(e) => setMedia({ ...media, title: e.target.value })}
                        />

                        <InputFieldLine $isName />

                        <InputField
                            value={media.description}
                            placeholder={'Add a Description'}
                            onChange={(e) => setMedia({ ...media, description: e.target.value })}
                        />
                    </InputContainer>

                    <BookmarkImageComponent
                        disabled
                        cover={media.source}
                        tabId={Number(tabId)}
                        defaultImage={COVER_URL}
                        onChangeImage={(image) => setMedia({ ...media, source: image })}
                    />

                    <BookmarkSubmitButton
                    // onClick={onSubmit}
                    // disabled={loading || deleting}
                    >
                        {loading
                            ? <Spinner color={Colors.light} />
                            : <BookmarkSubmitButtonText>
                                Save
                            </BookmarkSubmitButtonText>
                        }
                    </BookmarkSubmitButton>
                </PageProvider>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <PageProvider>
                Hmm something went wrong
            </PageProvider>
        </PageContainer>
    )
}

export default NewItemPage
