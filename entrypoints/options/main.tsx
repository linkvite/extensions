import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/assets/styles.css';
import {App} from '@/components/app';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div className="mx-auto max-w-lg py-8">
			<App page="options" params={new URLSearchParams()} fullPage />
		</div>
	</StrictMode>,
);
