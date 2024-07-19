import "./styles.css";
import isPropValid from "@emotion/is-prop-valid";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import type { StyledTarget } from "styled-components/dist/types";
import { LogoAndTitle } from "~components/header";
import { useTheme } from "~hooks";
import { persistStateObservers } from "~utils/storage";
import { AuthProvider } from "./auth";
import { GlobalStyle, MountedComponent, RootComponent } from "./styles";

persistStateObservers({
	pluginLocal: ObservablePersistLocalStorage,
});

type RootProps = {
	$isAuth?: boolean;
	children: ReactNode;
};

export function RootProvider({ children, $isAuth = false }: RootProps) {
	const { theme } = useTheme();

	function shouldForwardProp(propName: string, target: StyledTarget<"web">) {
		return typeof target === "string" ? isPropValid(propName) : true;
	}

	return (
		<StyleSheetManager shouldForwardProp={shouldForwardProp}>
			<ThemeProvider theme={theme}>
				<RootComponent>
					<MountedComponent $isAuth={$isAuth}>{children}</MountedComponent>
				</RootComponent>
			</ThemeProvider>

			<Toaster
				toastOptions={{
					style: {
						color: theme.text,
						background: theme.background_sub,
					},
				}}
				position="bottom-center"
			/>

			<GlobalStyle bg={theme.background} />
		</StyleSheetManager>
	);
}

export function PageProvider({ children }: { children: ReactNode }) {
	return (
		<RootProvider>
			<AuthProvider>
				<LogoAndTitle />
				{children}
			</AuthProvider>
		</RootProvider>
	);
}
