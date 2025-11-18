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
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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

export const Typography = {
  heading: Platform.select({
    ios: 'HelveticaNeue-Bold',
    android: 'sans-serif-medium',
    default: 'Helvetica Neue',
    web: "'sohne', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  }),
  
  subheading: Platform.select({
    ios: 'HelveticaNeue',
    android: 'sans-serif',
    default: 'Helvetica Neue',
    web: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  }),
  
  body: Platform.select({
    ios: 'Helvetica',
    android: 'sans-serif',
    default: 'Helvetica',
    web: 'Helvetica, Arial, sans-serif',
  }),
};

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
    fontSize: 22,
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
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
};
