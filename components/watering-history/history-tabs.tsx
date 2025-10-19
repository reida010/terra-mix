import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export const HISTORY_TABS = [
  { id: 'history', label: 'Watering history' },
  { id: 'charts', label: 'Charts' },
  { id: 'info', label: 'Plant Info' },
] as const;

export type HistoryTabId = (typeof HISTORY_TABS)[number]['id'];

type HistoryPalette = typeof Colors.light;

interface HistoryTabsProps {
  activeTab: HistoryTabId;
  onSelect: (tab: HistoryTabId) => void;
  palette: HistoryPalette;
  isCompact: boolean;
}

export function HistoryTabs({ activeTab, onSelect, palette, isCompact }: HistoryTabsProps) {
  return (
    <View
      style={[styles.container, isCompact && styles.containerCompact]}
      accessibilityRole="tablist">
      {HISTORY_TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={[
              styles.button,
              {
                borderColor: isActive ? palette.accent : palette.border,
                backgroundColor: isActive ? palette.accentSoft : palette.surface,
              },
              isCompact && styles.buttonCompact,
            ]}
            onPress={() => onSelect(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}>
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.label,
                { color: isActive ? palette.accent : palette.text },
                isCompact && styles.labelCompact,
              ]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  containerCompact: {
    flexWrap: 'wrap',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  buttonCompact: {
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
  },
  labelCompact: {
    textAlign: 'center',
  },
});
