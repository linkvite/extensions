export const Colors = {
    //primary
    primary: "#FA5A5F",
    primary_mid: "#FF6D6D",
    primary_sub: "#EF9A9A",
    primary_light: "#FFEBEE",
    trans: "rgba(0, 0, 0, 0.4)",
    primaryRGBA: "rgba(250, 90, 95, 1)",

    //light theme.
    light: "#FFFFFF",
    light_mid: "#EEEEEE",
    light_sub: "#F9F9F9",
    light_bg: "#E3E5E8",
    light_bg_top: "#EBEDEF",
    light_bg_mid: "#F2F3F5",
    light_bg_sub: "#FFFFFF",
    light_divider: "#bdbdbd",
    light_text: "#202225",
    light_text_sub: "#64748B",

    text_sub: "#e0e0e0",

    //dark
    dark: "#212121",
    dark_sub: "#757575",
    dark_mid: "#424242",
    dark_bg: "#202225",
    dark_bg_top: "#292B2F",
    dark_bg_mid: "#2F3136",
    dark_bg_sub: "#36393F",
    dark_divider: "#616161",
    dark_text: "#FFFFFF",
    dark_text_sub: "#bdbdbd",
    transparent_bg: "rgba(0, 0, 0, 0.025)",
    transparent_bg_mid: "rgba(0, 0, 0, 0.03)",
    transparent_bg_mid2: "rgba(0, 0, 0, 0.05)",
    transparent_bg_max: "rgba(0, 0, 0, 0.09)",
    transparent_bg_deep: "rgba(0, 0, 0, 0.8)",
    transparent_bg_modal: "rgba(0, 0, 0, 0.4)",

    // Utilities
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
    background_top: Colors.light_bg_top,
    background_mid: Colors.light_bg_mid,
    background_sub: Colors.light_sub,

    trans_bg: "rgba( 229, 229, 234, 0.5 )",
    trans_bg_opp: "rgba(0,0,0,0.1)",

    border: Colors.trans,
    border_sub: Colors.light_sub,
    accent: Colors.light_mid,
    accent_sub: Colors.dark_sub,

    activeTab: Colors.light_bg,
    divider: Colors.light_divider,
    opp_divider: Colors.dark_divider,
};

export const DarkTheme = {
    text: Colors.dark_text,
    text_sub: Colors.dark_text_sub,

    background: "#000000",
    background_top: Colors.dark_bg_top,
    background_mid: Colors.dark_bg_mid,
    background_sub: "#1A1A1A",

    trans_bg: "rgba( 72, 72, 74, 0.4 )",
    trans_bg_opp: "rgba( 209, 209, 214, 0.15 )",

    border: Colors.trans,
    border_sub: Colors.light_sub,
    accent: Colors.dark,
    accent_sub: Colors.light_sub,

    activeTab: Colors.dark_bg_sub,
    divider: Colors.dark_divider,
    opp_divider: Colors.light_divider,
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