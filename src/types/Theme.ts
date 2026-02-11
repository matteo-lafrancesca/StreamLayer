export interface ThemeConfig {
    colors?: {
        primary?: string;
        primaryLight?: string;
        primaryDark?: string;
        secondary?: string;
        accent?: string;
    };
    gradients?: {
        primary?: string;
        primaryVibrant?: string;
        accent?: string;
        text?: string;
        textPrimary?: string;
        dark?: string;
        purple?: string;
        red?: string;
    };
    neutrals?: {
        white?: string;
        black?: string;
        gray50?: string;
        gray100?: string;
        gray200?: string;
        gray300?: string;
        gray400?: string;
        gray500?: string;
        gray600?: string;
        gray700?: string;
        gray800?: string;
        gray900?: string;
    };
    backgrounds?: {
        primary?: string;
        secondary?: string;
        dark?: string;
        card?: string;
    };
    text?: {
        primary?: string;
        secondary?: string;
        tertiary?: string;
        light?: string;
        white?: string;
    };
    state?: {
        success?: string;
        warning?: string;
        error?: string;
        info?: string;
    };
    spotify?: {
        green?: string;
        greenHover?: string;
    };
    radius?: {
        none?: string;
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
        xxl?: string; // 2xl
        xxxl?: string; // 3xl
        round?: string;
        pill?: string;
    };
    elements?: {
        slider?: string;
    };
}
