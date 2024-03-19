export const Colors = {
    primary: "#FA5A5F",
    trans: "rgba(0, 0, 0, 0.4)",

    light: "#FFFFFF",
    light_sub: "#F9F9F9",
    light_text: "#202225",

    dark: "#212121",
    dark_sub: "#757575",
    dark_text: "#FFFFFF",
    dark_text_sub: "#bdbdbd",

    safe: "#2196f3",
    safe_mid: "#1565c0",
    error: "#ff4747",
    warning: "#ffc007",
    orange: "#ff9800",
    success: "#1DB954",
    border_color: "#bdbdbd",
    purple: "#5e35b1",
    indigo: "#3f51b5",
};

export const LightTheme = {
    text: Colors.light_text,
    text_sub: Colors.dark_sub,

    background: Colors.light,
    background_sub: Colors.light_sub,

    trans_bg: "rgba( 229, 229, 234, 0.5 )",
    trans_bg_opp: "rgba(0,0,0,0.1)"
};

export const DarkTheme = {
    text: Colors.dark_text,
    text_sub: Colors.dark_text_sub,

    background: "#000000",
    background_sub: "#1A1A1A",

    trans_bg: "rgba( 72, 72, 74, 0.4 )",
    trans_bg_opp: "rgba( 209, 209, 214, 0.15 )"
};

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