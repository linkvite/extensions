import { useState } from "react"
import toast from "react-hot-toast"
import React, { useCallback, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import type { Bookmark, ParsedLinkData } from "@linkvite/js"
import type {
    ExistsMessageRequest,
    ExistsMessageResponse
} from "~background/messages/exists"
import type {
    ParseMessageRequest,
    ParseMessageResponse
} from "~background/messages/parse"
import {
    BookmarkView,
    BookmarkImageComponent
} from "~components/bookmark"
import {
    InputContainer,
    InputField,
    InputFieldLine,
    BookmarkSubmitButton,
    BookmarkSubmitButtonText
} from "~components/bookmark/styles"
import { Spinner } from "~components/spinner"
import { COVER_URL } from "~utils"
import { Colors } from "~utils/styles"

export function NewLinkPage({ params }: { params: URL }) {
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<ParsedLinkData>();
    const [bookmark, setBookmark] = useState<Bookmark>();

    const url = decodeURIComponent(params.searchParams.get('url') || '');
    const tabId = decodeURIComponent(params.searchParams.get('tabId') || '');

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

        init();
    }, [checkExists, fetchFromAPI, url]);

    return (
        <React.Fragment>
            {!exists && data
                ? <FromParsedData
                    url={url}
                    tabId={tabId}
                    loading={loading}
                    data={data}
                    setData={setData}
                />
                : exists && bookmark
                    ? <BookmarkView
                        exists={exists}
                        bookmark={bookmark}
                        tabId={Number(tabId)}
                        defaultImage={COVER_URL}
                        setBookmark={setBookmark}
                    />
                    : <Spinner />
            }
        </React.Fragment>
    )
}

type ParsedDataProps = {
    url: string
    tabId: string
    loading: boolean
    data: ParsedLinkData
    setData: (data: ParsedLinkData) => void
}

function FromParsedData({ url, tabId, loading, data, setData }: ParsedDataProps) {
    return (
        <React.Fragment>
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
        </React.Fragment>
    )
}