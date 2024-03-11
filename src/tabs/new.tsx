import { useMemo } from "react";
import { PageProvider } from "~components/wrapper";

function NewItemPage() {
    const url = useMemo(() => new URL(window.location.href), []);
    const link = decodeURIComponent(url.searchParams.get('link') || '');
    const note = decodeURIComponent(url.searchParams.get('note') || '');

    return (
        <PageProvider>
            <div style={{ width: '100%' }}>
                <h2>New Item</h2>
                <p>Link: {link}</p>
                <p>note: {note}</p>
            </div>
        </PageProvider>
    )
}

export default NewItemPage
