import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/assets/styles.css';
import {App, type Page} from '@/components/app';

const params = new URLSearchParams(location.search);
const pages: Page[] = ['save', 'link', 'image', 'tabs', 'options'];
const page = (pages.find((p) => p === params.get('page')) ?? 'save') as Page;

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App page={page} params={params} fullPage={params.get('window') === '1'} />
	</StrictMode>,
);
