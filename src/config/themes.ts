import type { ThemeConfig } from '../types/Theme';

export const defaultTheme: ThemeConfig = {
    colors: {
        primary: '#6366f1',
        primaryLight: '#818cf8',
        primaryDark: '#4f46e5',
        secondary: '#8b5cf6',
        accent: '#d946ef',
    },
    gradients: {
        primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        primaryVibrant: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
        accent: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        text: 'linear-gradient(to right, #fff, #818cf8)',
        textPrimary: 'linear-gradient(135deg, #fff 30%, #6366f1 100%)',
        dark: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        red: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    },
    neutrals: {
        white: '#ffffff',
        black: '#000000',
        gray50: '#f9fafb',
        gray100: '#f3f4f6',
        gray200: '#e5e7eb',
        gray300: '#d1d5db',
        gray400: '#9ca3af',
        gray500: '#6b7280',
        gray600: '#4b5563',
        gray700: '#374151',
        gray800: '#1f2937',
        gray900: '#111827',
    },
    backgrounds: {
        primary: '#F9F9F9',
        secondary: '#ffffff',
        dark: '#030712',
        card: '#ffffff',
    },
    text: {
        primary: '#222222',
        secondary: '#666666',
        tertiary: '#888888',
        light: '#9ca3af',
        white: '#f9fafb',
    },
    state: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },
    spotify: {
        green: '#1db954',
        greenHover: '#1ed760',
    },
    radius: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px',
        xxxl: '24px',
        round: '50%',
        pill: '99px',
    },
    elements: {
        slider: '#222222',
    },
};

export const darkTheme: ThemeConfig = {
    ...defaultTheme,
    backgrounds: {
        primary: '#0f172a',
        secondary: '#1e293b',
        dark: '#020617',
        card: '#1e293b',
    },
    text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        light: '#64748b',
        white: '#ffffff',
    },
    neutrals: {
        ...defaultTheme.neutrals,
        gray50: '#1e293b',
        gray100: '#334155',
        gray200: '#475569',
        gray300: '#64748b',
        gray400: '#94a3b8',
        gray500: '#cbd5e1',
        gray600: '#e2e8f0',
        gray700: '#f1f5f9',
        gray800: '#f8fafc',
        gray900: '#ffffff',
    },
    elements: {
        slider: '#6366f1',
    }
};

export const ikeaTheme: ThemeConfig = {
    ...defaultTheme,
    colors: {
        primary: '#ffda1a',
        primaryLight: '#ffe04d',
        primaryDark: '#ccaa00',
        secondary: '#0051ba',
        accent: '#ffda1a',
    },
    backgrounds: {
        primary: '#0051ba',
        secondary: '#004195',
        dark: '#003170',
        card: '#0046a1',
    },
    text: {
        primary: '#ffffff',
        secondary: '#ffda1a',
        tertiary: '#cbd5e1',
        light: '#94a3b8',
        white: '#ffffff',
    },
    gradients: {
        ...defaultTheme.gradients,
        primary: 'linear-gradient(135deg, #ffda1a 0%, #e6c417 100%)',
        primaryVibrant: 'linear-gradient(135deg, #0051ba 0%, #ffda1a 100%)',
        dark: 'linear-gradient(135deg, #0051ba 0%, #003e8f 100%)',
    },
    neutrals: {
        ...defaultTheme.neutrals,
        gray50: '#004195',
        gray100: '#0046a1',
        gray200: '#0051ba',
        gray300: '#3373c8',
        gray400: '#6696d6',
        gray500: '#cbd5e1',
        gray600: '#e2e8f0',
        gray700: '#f1f5f9',
        gray800: '#f8fafc',
        gray900: '#ffffff',
    },
    elements: {
        slider: '#ffda1a',
    }
};

export const themes: Record<string, ThemeConfig> = {
    default: defaultTheme,
    dark: darkTheme,
    ikea: ikeaTheme,
};
