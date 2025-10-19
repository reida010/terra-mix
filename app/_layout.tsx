import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { PlantProvider } from '@/context/PlantContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const navigationTheme = colorScheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: palette.accent,
          background: palette.background,
          card: palette.surface,
          border: palette.border,
          text: palette.text,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: palette.accent,
          background: palette.background,
          card: palette.surface,
          border: palette.border,
          text: palette.text,
        },
      };

  return (
    <ThemeProvider value={navigationTheme}>
      <SafeAreaProvider>
        <PlantProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </PlantProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
