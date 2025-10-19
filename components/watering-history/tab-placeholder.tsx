import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

interface TabPlaceholderProps {
  palette: typeof Colors.light;
  isCharts: boolean;
}

export function TabPlaceholder({ palette, isCharts }: TabPlaceholderProps) {
  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.border }]}
      lightColor={palette.surface}
      darkColor={palette.surface}>
      <ThemedText type="title">{isCharts ? 'Charts coming soon' : 'Plant info coming soon'}</ThemedText>
      <ThemedText style={[styles.copy, { color: palette.muted }]}>
        {isCharts
          ? 'Visualize trends, watering cadence, and nutrient insights here soon.'
          : 'Detailed plant profiles will live here. Hang tight!'}
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
