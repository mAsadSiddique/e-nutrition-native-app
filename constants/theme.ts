/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Typography constants following Medium-style font hierarchy:
 * - "sohne" for main headings (h1, h2) - bold, elegant, modern
 * - "Helvetica Neue" for subheadings (h3, h4) - clean, well-balanced
 * - Helvetica/Arial for paragraphs and body text - professional, neat, easy-to-read
 */
export const Typography = {
  // H1, H2 - Main headings using sohne (with fallbacks)
  heading: Platform.select({
    ios: 'HelveticaNeue-Bold', // Fallback to Helvetica Neue Bold on iOS if sohne not loaded
    android: 'sans-serif-medium', // Medium weight on Android
    default: 'Helvetica Neue',
    web: "'sohne', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  }),
  
  // H3, H4 - Subheadings using Helvetica Neue
  subheading: Platform.select({
    ios: 'HelveticaNeue',
    android: 'sans-serif',
    default: 'Helvetica Neue',
    web: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  }),
  
  // Body text using Helvetica or Arial
  body: Platform.select({
    ios: 'Helvetica',
    android: 'sans-serif',
    default: 'Helvetica',
    web: 'Helvetica, Arial, sans-serif',
  }),
};

// Typography styles for consistent usage across the app
export const TypographyStyles = {
  h1: {
    fontFamily: Typography.heading,
    fontWeight: '800' as const,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: Typography.heading,
    fontWeight: '700' as const,
    fontSize: 28,
    lineHeight: 36,
  },
  h3: {
    fontFamily: Typography.subheading,
    fontWeight: '700' as const,
    fontSize: 22,
    lineHeight: 30,
  },
  h4: {
    fontFamily: Typography.subheading,
    fontWeight: '600' as const,
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontFamily: Typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
};
