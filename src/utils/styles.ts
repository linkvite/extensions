export const Colors = {
    dark: "#212121",
    light: "#FFFFFF",
    error: "#ff4747",
    orange: "#ff9800",
    warning: "#ffc007",
    primary: "#FA5A5F",
    success: "#1DB954",
    dark_sub: "#757575",
} as const;

export const LightTheme = {
    text: "#202225",
    text_sub: Colors.dark_sub,
    background: Colors.light,
    background_sub: "#F9F9F9",
    trans_bg: "rgba( 229, 229, 234, 0.5 )",
    trans_bg_opp: "rgba(0,0,0,0.1)"
} as const;

export const DarkTheme = {
    text: "#FFFFFF",
    text_sub: "#bdbdbd",
    background: "#000000",
    background_sub: "#1A1A1A",
    trans_bg: "rgba( 72, 72, 74, 0.4 )",
    trans_bg_opp: "rgba( 209, 209, 214, 0.15 )"
} as const;

export type ITheme = typeof LightTheme | typeof DarkTheme;

export const Fonts = {
    _5xl: '4.5rem',
    _4xl: '3.5rem',
    _3xl: '3rem',
    xxl: '2.25rem',
    xl: '2rem',
    lg: '1.75rem',
    md: '1.45rem',
    sm: '1.25rem',
    _sm: '1.15rem',
    xs: '1rem',
    xxs: '0.85rem',
    _3xs: '0.75rem',
};