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
  heading: 'Georgia-Bold',
  subheading: 'Georgia-Regular', 
  body: 'Inter-Regular',
  sans: 'Inter-Regular'
};
export const TypographyStyles = {
  h1: {
    fontFamily: Typography.heading,
    fontWeight: 'normal' as const,   // Georgia-Bold file controls weight
    fontSize: 49,
    lineHeight: 52,
    letterSpacing: -0.6,
  },
  h2: {
    fontFamily: Typography.heading,
    fontWeight: 'normal' as const,   // Georgia-Bold file controls weight
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: Typography.subheading,
    fontWeight: 'normal' as const,   // Georgia-Bold file controls weight
    fontSize: 24,
    lineHeight: 32,
  },
  h4: {
    fontFamily: Typography.subheading,
    fontWeight: 'normal' as const,   // Georgia-Bold file controls weight
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: Typography.body,
    fontWeight: 'normal' as const,   // Inter-Regular file controls weight
    fontSize: 18,
    lineHeight: 28,
  },
  bodySmall: {
    fontFamily: Typography.body,
    fontWeight: 'normal' as const,   // Inter-Regular file controls weight
    fontSize: 16,
    lineHeight: 24,
  },
  // Inter variants for UI elements
  bodySans: {
    fontFamily: Typography.sans,
    fontWeight: 'normal' as const,
    fontSize: 16,
    lineHeight: 22,
  },
  bodySmallSans: {
    fontFamily: Typography.sans,
    fontWeight: 'normal' as const,
    fontSize: 14,
    lineHeight: 20,
  },
  // Bold variants using Inter for UI elements
  bodySansBold: {
    fontFamily: Typography.sans,
    fontWeight: '600' as const,
    fontSize: 16,
    lineHeight: 22,
  },
  bodySmallSansBold: {
    fontFamily: Typography.sans,
    fontWeight: '600' as const,
    fontSize: 14,
    lineHeight: 20,
  },
};
