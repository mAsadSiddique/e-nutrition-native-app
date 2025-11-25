import { StyleSheet, Text, type TextProps } from 'react-native';

import { TypographyStyles } from '../constants/theme';
import { useThemeColor } from '../hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...TypographyStyles.body,
  },
  defaultSemiBold: {
    ...TypographyStyles.body,
    fontWeight: 'normal', // Use normal weight with custom fonts
  },
  title: {
    ...TypographyStyles.h1,
  },
  subtitle: {
    ...TypographyStyles.h3,
  },
  link: {
    ...TypographyStyles.body,
    color: '#0a7ea4',
  },
});
