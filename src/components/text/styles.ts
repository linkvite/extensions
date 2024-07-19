import styled, { css } from "styled-components";
import {
	calculateFontSize,
	calculateFontWeight,
	calculateLetterSpacing,
	calculateLineHeight,
	calculateMargin,
	calculateMaxWidth,
	calculateTextAlign,
	calculateTextDecoration,
	calculateTextTransform,
	calculateWidth,
	getTextColor,
} from "./helpers";
import type { StyledTextProps } from "./types";

export const DefaultText = styled.p<StyledTextProps>`
    margin: 0;
    display: inline-block;

    ${(p: StyledTextProps) => css`
        color: ${getTextColor(p)};
        text-align: ${calculateTextAlign(p)};
        width: ${calculateWidth(p)};
        margin-top: ${calculateMargin(p)};
        margin-bottom: ${calculateMargin(p)};
        text-decoration: ${calculateTextDecoration(p)};
        font-weight: ${calculateFontWeight(p)};
        font-size: ${calculateFontSize(p)};
        text-transform: ${calculateTextTransform(p)};
        line-height: ${calculateLineHeight(p)};
        letter-spacing: ${calculateLetterSpacing(p)};
        max-width: ${calculateMaxWidth(p)};
    `}
`;
