import "./styles.css";
import { useTheme } from "~hooks";
import { AuthProvider } from "./auth";
import { Toaster } from "react-hot-toast";
import isPropValid from "@emotion/is-prop-valid";
import { LogoAndTitle } from "~components/header";
import { persistStateObservers } from "~utils/storage";
import { GlobalStyle, MountedComponent, RootComponent } from "./styles";
import { ThemeProvider, StyleSheetManager } from "styled-components";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import type { StyledTarget } from "styled-components/dist/types";
import type { ReactNode } from "react";

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
