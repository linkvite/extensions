// a script that moves files from build/safari-mv3-prod
// to ../src/...
// let root = './build/safari-mv3-prod';
// 1. move ./static/background/index.js to <mobile>/src/background.js
// 2. move ./popup.[id].js to <mobile>/src/popup.js
// 3. move ./popup.[id].css to <mobile>/src/index.css

const fs = require("fs");

const build = "./build";
const root = `${build}/safari-mv3-prod`;
const destination = "../linkvite/horus/SafariExtension/src";

const files = [
	{
		from: `${root}/static/background/index.js`,
		to: `${destination}/background.js`,
	},
];

const popupJSFile = fs
	.readdirSync(`${root}/`)
	.find((file) => file.startsWith("popup.") && file.endsWith(".js"));
const popupCSSFile = fs
	.readdirSync(`${root}/`)
	.find((file) => file.startsWith("popup.") && file.endsWith(".css"));

if (popupJSFile) {
	files.push({ from: `${root}/${popupJSFile}`, to: `${destination}/popup.js` });
}

if (popupCSSFile) {
	files.push({
		from: `${root}/${popupCSSFile}`,
		to: `${destination}/index.css`,
	});
}

files.forEach(({ from, to }) => {
	fs.copyFileSync(from, to);
	console.log(`moved ${from} to ${to}`);
});
