/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const brandPrimary = '#00587A';
const brandAccent = '#0693C9';
const brandBackground = '#F2F7FA';
const brandSurfaceMuted = '#E1F1F8';
const brandBorder = '#A3C3D2';
const brandText = '#0F3445';
const brandIcon = '#4E6C7A';
const brandSuccess = '#1F9A78';
const brandDanger = '#C75660';

const darkBackground = '#021C26';
const darkSurface = '#052A3A';
const darkSurfaceMuted = '#0B384B';
const darkBorder = '#114357';
const darkText = '#E4F3FA';
const darkIcon = '#82AEC0';
const darkPrimary = '#4BA7D3';
const darkAccent = '#5CC0F1';
const darkSuccess = '#4FD0A3';
const darkDanger = '#F0959A';

export const Colors = {
  light: {
    text: brandText,
    background: brandBackground,
    surface: '#FFFFFF',
    surfaceMuted: brandSurfaceMuted,
    primary: brandPrimary,
    primarySoft: '#C7E0EA',
    accent: brandAccent,
    accentSoft: '#D3EAF7',
    icon: brandIcon,
    muted: '#587685',
    border: brandBorder,
    borderStrong: '#6F97A8',
    tint: brandAccent,
    tabIconDefault: '#7EA9BB',
    tabIconSelected: brandAccent,
    success: brandSuccess,
    danger: brandDanger,
  },
  dark: {
    text: darkText,
    background: darkBackground,
    surface: darkSurface,
    surfaceMuted: darkSurfaceMuted,
    primary: darkPrimary,
    primarySoft: '#0C3B4D',
    accent: darkAccent,
    accentSoft: '#0F4860',
    icon: darkIcon,
    muted: '#7EA6B7',
    border: darkBorder,
    borderStrong: '#1A556C',
    tint: darkAccent,
    tabIconDefault: '#4F7484',
    tabIconSelected: darkAccent,
    success: darkSuccess,
    danger: darkDanger,
  },
};

const primaryFont = Platform.select({
  web: '"Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif',
  default: 'Roboto',
});

const secondaryFont = Platform.select({
  web: '"Roboto Slab", Georgia, "Times New Roman", serif',
  default: 'Roboto Slab',
});

export const FontFamilies = {
  primary: primaryFont ?? 'sans-serif',
  secondary: secondaryFont ?? 'serif',
};

export const Fonts = Platform.select({
  ios: {
    sans: FontFamilies.primary,
    serif: FontFamilies.secondary,
    rounded: FontFamilies.primary,
    mono: 'Menlo',
  },
  android: {
    sans: FontFamilies.primary,
    serif: FontFamilies.secondary,
    rounded: FontFamilies.primary,
    mono: 'monospace',
  },
  default: {
    sans: FontFamilies.primary,
    serif: FontFamilies.secondary,
    rounded: FontFamilies.primary,
    mono: 'monospace',
  },
  web: {
    sans: primaryFont ?? 'sans-serif',
    serif: secondaryFont ?? 'serif',
    rounded: primaryFont ?? 'sans-serif',
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
