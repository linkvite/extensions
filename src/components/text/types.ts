import type React from "react";
import type { Colors, Fonts, ITheme } from "~utils/styles";

export type StyledTextProps = {
	color?: Color;
	width?: string;
	theme?: ITheme;
	maxWidth?: string;
	fontSize?: FontSize;
	isSubText?: boolean;
	textAlign?: TextAlign;
	fontWeight?: FontWeight;
	topSpacing?: MarginSpacing;
	bottomSpacing?: MarginSpacing;
	lineHeight?: LineHeight;
	textTransform?: TextTransform;
	textDecoration?: TextDecoration;
	letterSpacing?: LetterSpacing;
} & React.HTMLAttributes<HTMLParagraphElement>;

type Sizes = "none" | "xs" | "sm" | "md" | "lg" | "xl";
type MarginSpacing = Sizes | string;
type TextAlign = "left" | "center" | "right";
type TextDecoration = "underline" | "line-through" | "none";
type Color = keyof typeof Colors;
type FontSize = keyof typeof Fonts;
type FontWeight = "normal" | "bold" | string;
type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
type LineHeight = Sizes | string;
type LetterSpacing = Sizes | string;
