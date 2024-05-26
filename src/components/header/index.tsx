import { closeTab } from "~router";
import { useMemo, type ReactNode } from "react";
import { settingStore } from "~stores";
import { APP_DOMAIN, FAVICON_URL } from "~utils";
import { useSelector } from "@legendapp/state/react";
import { Favicon, LinkviteLogo, HeaderButton, HeaderButtons } from "./styles";

export function Logo({ body }: { body?: ReactNode }) {
	return (
		<LinkviteLogo $hasButtons={!!body}>
			<a href={APP_DOMAIN}>
				<Favicon alt="paws" src={FAVICON_URL} />
				Linkvite
			</a>

			{body}
		</LinkviteLogo>
	);
}

export function LogoAndTitle({ noClose }: { noClose?: boolean }) {
	const { currentPage } = useSelector(settingStore);

	const inOptions = useMemo(() => {
		return currentPage === "options";
	}, [currentPage]);

	function onSettings() {
		settingStore.currentPage.set(inOptions ? "popup" : "options");
	}

	function onClose() {
		settingStore.currentPage.set("popup");
		closeTab(true);
	}

	const body = (
		<HeaderButtons>
			{inOptions ? null : (
				<HeaderButton onClick={onSettings}>Settings</HeaderButton>
			)}

			{noClose ? null : <HeaderButton onClick={onClose}>Close</HeaderButton>}
		</HeaderButtons>
	);
	return <Logo body={body} />;
}
