import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

interface ChartsPlaceholderProps {
  palette: typeof Colors.light;
}

export function ChartsPlaceholder({ palette }: ChartsPlaceholderProps) {
  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.border }]}
      lightColor={palette.surface}
      darkColor={palette.surface}>
      <ThemedText type="title">Charts coming soon</ThemedText>
      <ThemedText style={[styles.copy, { color: palette.muted }]}>
        Visualize trends, watering cadence, and nutrient insights here soon.
      </ThemedText>
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
