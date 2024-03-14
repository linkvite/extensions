import { COVER_URL } from "~utils";
import { Colors } from "~utils/styles";
import { Spinner } from "~components/spinner";
import {
    InputContainer,
    InputField,
    InputFieldLine,
    BookmarkSubmitButton,
    BookmarkSubmitButtonText
} from "~components/bookmark/styles";
import { BookmarkImageComponent } from "~components/bookmark";
import React, { useState } from "react";

export function NewImagePage({ params }: { params: URL }) {
    const [loading] = useState(false);
    const url = decodeURIComponent(params.searchParams.get('url') || '');
    const tabId = decodeURIComponent(params.searchParams.get('tabId') || '');

    const [media, setMedia] = useState({
        title: "",
        starred: false,
        description: "",
        tags: [] as string[],
        source: url,
    });

    return (
        <React.Fragment>
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
        </React.Fragment>
    )
}