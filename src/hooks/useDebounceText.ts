import { useEffect, useState } from "react";

/**
 * Debounce text input
 * @returns [text, setQuery]
 */
export function useDebounceText(str = "") {
	const [text, setText] = useState(str);
	const [query, setQuery] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => {
			const trimmed = text.trim();
			setQuery(trimmed);
		}, 300);

		return () => clearTimeout(timeout);
	}, [text]);

	return { query, text, setText };
}
