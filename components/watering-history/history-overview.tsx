import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { WateringHistory } from '@/components/watering-history';
import { Colors } from '@/constants/theme';
import { PlantState, WateringLogEntry } from '@/types/plant';

interface HistoryOverviewProps {
  plant: PlantState;
  palette: typeof Colors.light;
  isCompact: boolean;
  onStartLogging: () => void;
  onOpenMenu: () => void;
  onEditLog: (log: WateringLogEntry) => void;
  onDeleteLog: (log: WateringLogEntry) => void;
}

export function HistoryOverview({
  plant,
  palette,
  isCompact,
  onStartLogging,
  onOpenMenu,
  onEditLog,
  onDeleteLog,
}: HistoryOverviewProps) {
  return (
    <>
      <View style={[styles.header, isCompact && styles.headerCompact]}>
        <ThemedText type={isCompact ? 'defaultSemiBold' : 'title'} style={isCompact && styles.titleCompact}>
          Watering history
        </ThemedText>
        <View style={[styles.actions, isCompact && styles.actionsCompact]}>
          <Pressable
            style={[
              styles.addLogButton,
              { borderColor: palette.accent, backgroundColor: palette.accentSoft },
              isCompact && styles.addLogButtonCompact,
            ]}
            onPress={onStartLogging}
            accessibilityRole="button">
            <ThemedText
              type="defaultSemiBold"
              style={[styles.addLogLabel, { color: palette.accent }, isCompact && styles.addLogLabelCompact]}>
              + Log watering
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.menuButton,
              { borderColor: palette.border, backgroundColor: palette.surface },
              isCompact && styles.menuButtonCompact,
            ]}
            onPress={onOpenMenu}
            accessibilityRole="button"
            accessibilityLabel={`Open actions for ${plant.name}`}>
            <ThemedText
              type={isCompact ? 'defaultSemiBold' : 'title'}
              style={[styles.menuLabel, { color: palette.accent }, isCompact && styles.menuLabelCompact]}>
              ⋯
            </ThemedText>
          </Pressable>
        </View>
      </View>
      <WateringHistory logs={plant.logs} onEdit={onEditLog} onDelete={onDeleteLog} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  headerCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionsCompact: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: 8,
  },
  addLogButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  addLogButtonCompact: {
    flex: 1,
  },
  addLogLabel: {
    fontSize: 14,
  },
  addLogLabelCompact: {
    textAlign: 'center',
  },
  menuButton: {
    width: 42,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonCompact: {
    width: 36,
    height: 36,
  },
  menuLabel: {
    marginTop: -4,
  },
  menuLabelCompact: {
    marginTop: 0,
  },
});
