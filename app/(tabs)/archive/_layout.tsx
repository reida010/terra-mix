import React from 'react';
import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ArchiveStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.text,
        headerTitleStyle: { color: palette.text },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
