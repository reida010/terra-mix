import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

interface TabPlaceholderProps {
  palette: typeof Colors.light;
  title?: string;
  description?: string;
}

export function TabPlaceholder({ palette, title, description }: TabPlaceholderProps) {
  const heading = title ?? 'Plant info coming soon';
  const body =
    description ?? 'Detailed plant profiles will live here. Hang tight!';
  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.border }]}
      lightColor={palette.surface}
      darkColor={palette.surface}>
      <ThemedText type="title">{heading}</ThemedText>
      {body ? <ThemedText style={[styles.copy, { color: palette.muted }]}>{body}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 18,
    padding: 24,
    gap: 12,
    borderWidth: 1,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
  },
});
