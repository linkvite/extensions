import React from "react";
import { DefaultText } from "./styles";
import { type StyledTextProps } from "./types";

interface IProps extends StyledTextProps {
    children: React.ReactNode;
}

export function AppText({ children, ...rest }: IProps) {
    return (
        <DefaultText {...rest}>
            {children}
        </DefaultText>
    );
}
