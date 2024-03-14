import React, { useMemo } from "react";
import { PageContainer } from "~styles";
import { PageProvider } from "~components/wrapper";
import { NewTabsPage } from "~components/pages/tabs";
import { NewLinkPage } from "~components/pages/link";
import { NewImagePage } from "~components/pages/image";
import { OptionsPage } from "~components/pages/options";
import { BookmarkPage } from "~components/pages/bookmark";

type LinkType = "link" | "image" | "tabs" | "bookmark" | "options";

function IndexPage() {
    const params = useMemo(() => new URL(window.location.href), []);
    const type = decodeURIComponent(params.searchParams.get('type') || '') as LinkType;

    const Page = useMemo(() => ({
        "tabs": <NewTabsPage />,
        "options": <OptionsPage />,
        "link": <NewLinkPage params={params} />,
        "image": <NewImagePage params={params} />,
        "bookmark": <BookmarkPage params={params} />
    }), [params]);

    return (
        <PageProvider>
            <PageContainer>
                {Page[type] || <div>Sorry, this page does not exist</div>}
            </PageContainer>
        </PageProvider>
    )
}

// eslint-disable-next-line import/no-unused-modules
export default IndexPage
