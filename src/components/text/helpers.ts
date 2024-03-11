import { Colors, Fonts } from "~utils/styles";
import type { StyledTextProps } from "./types";

/**
 * If the color prop is passed, return the color from the Colors object, otherwise return the text
 * color from the theme.
 *
 * @param {StyledTextProps} props - StyledTextProps - This is the props that are passed to the
 * component.
 * @returns The color from the Colors object or the text color from the theme.
 */
export function getTextColor(props: StyledTextProps) {
    const { color, $isSubText, theme } = props;

    if (color) return Colors[color];
    if ($isSubText) return theme?.text_sub;

    return theme?.text || Colors.light;
}

/**
 * "If the topSpacing prop is set to a value, return the corresponding margin-top value, otherwise
 * return 0."
 *
 * @param {StyledTextProps} props - StyledTextProps - this is the props that are passed into the
 * styled component.
 * @returns A string that represents the margin-top value.
 */
export function calculateMargin(props: StyledTextProps) {
    const { topSpacing } = props;
    const defaultMarginTop = "0";

    if (topSpacing === "none") return defaultMarginTop;
    if (topSpacing === "xs") return "0.25rem";
    if (topSpacing === "sm") return "0.5rem";
    if (topSpacing === "md") return "1rem";
    if (topSpacing === "lg") return "1.5rem";
    if (topSpacing === "xl") return "2rem";

    if (typeof topSpacing === "string") return topSpacing;

    return defaultMarginTop;
}

/**
 * If the textAlign prop is left, center, or right, return that value, otherwise return left.
 *
 * @param {StyledTextProps} props - StyledTextProps
 * @returns The textAlign value.
 */
export function calculateTextAlign(props: StyledTextProps) {
    const { textAlign } = props;

    if (textAlign === "left") return "left";
    if (textAlign === "center") return "center";
    if (textAlign === "right") return "right";

    return "left";
}

/**
 * If the textDecoration prop is set to underline, return underline, otherwise if it's set to
 * line-through, return line-through, otherwise return none.
 *
 * @param {StyledTextProps} props - StyledTextProps - This is the props that are passed to the styled
 * component.
 * @returns A string that represents the text-decoration value.
 */
export function calculateTextDecoration(props: StyledTextProps) {
    const { textDecoration } = props;

    if (textDecoration === "underline") return "underline";
    if (textDecoration === "line-through") return "line-through";

    return "none";
}

/**
 * If the textTransform prop is uppercase, lowercase, or capitalize, return that value, otherwise
 * return none.
 *
 * @param {StyledTextProps} props - StyledTextProps
 * @returns A string that represents the text-transform value.
 */
export function calculateTextTransform(props: StyledTextProps) {
    const { textTransform } = props;

    if (textTransform === "uppercase") return "uppercase";
    if (textTransform === "lowercase") return "lowercase";
    if (textTransform === "capitalize") return "capitalize";

    return "none";
}

/**
 * It takes a fontSize prop, and if it's a valid font size, it returns the font size. Otherwise, it
 * returns the default font size
 *
 * @param {StyledTextProps} props - StyledTextProps - this is the props that are passed to the
 * component.
 * @returns The font size
 */
export function calculateFontSize(props: StyledTextProps) {
    const { fontSize } = props;

    if (!fontSize) return Fonts.xs;
    if (Object.keys(Fonts).includes(fontSize)) return Fonts[fontSize];

    return Fonts.xs;
}

/**
 * It takes a `fontWeight` prop, and returns a string that represents the font weight
 *
 * @param {StyledTextProps} props - StyledTextProps - this is the props that are passed to the
 * component.
 * @returns A string that represents the font weight.
 */
export function calculateFontWeight(props: StyledTextProps) {
    const { fontWeight } = props;
    const defaultFontWeight = "500";

    if (!fontWeight) return defaultFontWeight;

    if (fontWeight === "normal") return defaultFontWeight;
    if (fontWeight === "bold") return "600";
    if (typeof fontWeight === "string") return fontWeight;

    return defaultFontWeight;
}

/**
 * If the lineHeight prop is not provided, return the default line height. If the lineHeight prop is
 * provided, return the corresponding line height
 *
 * @param {StyledTextProps} props - StyledTextProps
 * @returns A string that represents the line height.
 */
export function calculateLineHeight(props: StyledTextProps) {
    const { lineHeight } = props;
    const defaultLineHeight = "1.6";

    if (!lineHeight) return defaultLineHeight;
    if (lineHeight === "none") return defaultLineHeight;
    if (lineHeight === "xs") return "1.25";
    if (lineHeight === "sm") return defaultLineHeight;
    if (lineHeight === "md") return "2";
    if (lineHeight === "lg") return "2.5";
    if (lineHeight === "xl") return "3";
    if (typeof lineHeight === "string") return lineHeight;

    return defaultLineHeight;
}

/**
 * If the letterSpacing prop is not provided, or is provided as "none", then the default letter spacing
 * of "0" is returned. Otherwise, if the letterSpacing prop is provided as "xs", "sm", "md", "lg", or
 * "xl", then the corresponding letter spacing is returned. Otherwise, if the letterSpacing prop is
 * provided as a string, then that string is returned. Otherwise, the default letter spacing of "0" is
 * returned
 *
 * @param {StyledTextProps} props - StyledTextProps
 * @returns A string representing the letter spacing.
 */
export function calculateLetterSpacing(props: StyledTextProps) {
    const { letterSpacing } = props;
    const defaultLetterSpacing = "0";

    if (!letterSpacing) return defaultLetterSpacing;
    if (letterSpacing === "none") return defaultLetterSpacing;
    if (letterSpacing === "xs") return "0.05rem";
    if (letterSpacing === "sm") return "0.1rem";
    if (letterSpacing === "md") return "0.15rem";
    if (letterSpacing === "lg") return "0.2rem";
    if (letterSpacing === "xl") return "0.25rem";
    if (typeof letterSpacing === "string") return letterSpacing;

    return defaultLetterSpacing;
}

/**
 * If the width prop is not provided, return "auto". If the width prop is a string, return the string.
 * Otherwise, return "auto"
 *
 * @param {StyledTextProps} props - StyledTextProps - This is the props that are passed to the styled
 * component.
 * @returns A string representing the width.
 */
export function calculateWidth(props: StyledTextProps) {
    const { width } = props;
    const defaultWidth = "auto";

    if (!width) return defaultWidth;
    if (typeof width === "string") return width;

    return defaultWidth;
}

/**
 * If the maxWidth prop is not provided, return a default value. If it is provided, return the value
 *
 * @param {StyledTextProps} props - StyledTextProps - this is the props that are passed to the styled
 * component.
 * @returns A string representing the max width.
 */
export function calculateMaxWidth(props: StyledTextProps) {
    const { maxWidth } = props;
    const defaultMaxWidth = "20rem";

    if (!maxWidth) return defaultMaxWidth;
    if (typeof maxWidth === "string") return maxWidth;

    return defaultMaxWidth;
}
