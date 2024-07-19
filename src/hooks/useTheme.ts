import { useSelector } from "@legendapp/state/react";
import { useEffect, useState } from "react";
import useDarkMode from "use-dark-mode";
import { settingStore } from "~stores";
import { DarkTheme, LightTheme } from "~utils/styles";

/**
 * It returns the current theme and color scheme,
 * Based on the user's theme preference and the device's color scheme.
 *
 * @returns An object with two properties: `theme` and `colorScheme`.
 */
export function useTheme() {
	const oldTheme = useSelector(settingStore.theme);
	const storageOptions = {
		storageKey: undefined,
		onChange: undefined,
	};
	const { value } = useDarkMode(false, storageOptions);
	const fromDevice = value ? "dark" : "light";
	const getCurrentTheme = oldTheme === "system" ? fromDevice : oldTheme;
	const [colorScheme, setColorScheme] = useState(getCurrentTheme);

	useEffect(() => {
		oldTheme === "system"
			? setColorScheme(fromDevice)
			: setColorScheme(oldTheme);

		return () => {
			setColorScheme(getCurrentTheme);
		};
	}, [fromDevice, getCurrentTheme, oldTheme]);

	const theme = colorScheme === "dark" ? DarkTheme : LightTheme;

	return { theme, colorScheme };
}
