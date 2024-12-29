## Browser Extensions for Linkvite

Easily save and organize bookmarks without leaving the page. This supports any Chronium-based browser, including Chrome, Arc, Edge, Opera, and Brave. Also works on Firefox, and Safari. See Plasmo's [documentation](https://docs.plasmo.com/framework/workflows/faq#what-are-the-officially-supported-browser-targets) for more information.

Currently only available on the [Chrome Web Store](https://chromewebstore.google.com/detail/linkvite/jdkkldhichblefcaiogghmmiijcacadn)

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, use: `build/chrome-mv3-dev`. 

<!-- note -->
> **Note**: NB: We use the `mv3` manifest version, which is the latest and recommended version for all new extensions.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. If you import some module and do some logic, then reload the extension on your browser.

> **Note**: The development build is not optimized for performance, and the size might look bloated. Use the production build for a better experience and performance.

To test the extension of Safari, you need to build the extension and load it manually. To do this, run the following:

```bash
pnpm test:safari
```

This will create a production build for the Safari browser. You can then load the extension manually by following the instructions [on Apple's documentation [1]](https://developer.apple.com/documentation/safariservices/safari_app_extensions/building_a_safari_app_extension).

This works by converting the extension to a Safari App Extension, which can be loaded manually on the browser. Read more about this on [Apple's documentation [2]](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari).


For further guidance, [visit Plasmo's Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build:all
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Building for a specific browser

To build for a specific browser, run the following:

```bash
pnpm build:<target>
```

Where `<target>` is the target browser. For example, to build for Chrome, run:

```bash
pnpm build:chrome
```

This will create a production build for the Chrome browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.