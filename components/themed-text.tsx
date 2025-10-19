import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, FontFamilies } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

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
  const theme = useColorScheme() ?? 'light';
  const accentColor = Colors[theme].accent;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: accentColor }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FontFamilies.primary,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FontFamilies.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: FontFamilies.secondary,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: FontFamilies.secondary,
    fontWeight: '500',
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
    fontFamily: FontFamilies.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
