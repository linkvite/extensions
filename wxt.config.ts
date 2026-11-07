import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'wxt';

// Linkvite browser extension (Chrome, Edge, Brave, Arc, Firefox, Safari).
// Build with WXT_API_ENV=staging to target staging; WXT_OAUTH_CLIENT_ID enables
// "Continue with Linkvite" (OAuth) where the browser supports identity.
export default defineConfig({
	modules: ['@wxt-dev/module-react'],
	// MV3 for every browser (WXT defaults Firefox and Safari to MV2)
	manifestVersion: 3,
	vite: () => ({plugins: [tailwindcss()]}),
	manifest: ({browser}) => ({
		name: 'Linkvite',
		description: 'Save and organize your bookmarks without leaving the page.',
		permissions: [
			'storage',
			'activeTab',
			'scripting',
			'contextMenus',
			...(browser === 'safari' ? [] : ['identity']),
		],
		optional_permissions: ['tabs'],
		host_permissions: ['<all_urls>'],
		omnibox: {keyword: 'lv'},
		action: {default_title: 'Save to Linkvite'},
		commands: {
			_execute_action: {
				suggested_key: {default: 'Alt+Shift+S'},
				description: 'Save the current page to Linkvite',
			},
		},
		...(browser === 'firefox'
			? {
					browser_specific_settings: {
						gecko: {id: 'extension@linkvite.io', strict_min_version: '115.0'},
					},
				}
			: {}),
	}),
});
