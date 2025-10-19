import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FEEDING_STAGE_LOOKUP } from '@/constants/feeding';
import { WateringLogEntry } from '@/types/plant';
import { formatMl } from '@/utils/feeding';

interface WateringHistoryProps {
  logs: WateringLogEntry[];
  onEdit: (log: WateringLogEntry) => void;
  onDelete: (log: WateringLogEntry) => void;
}

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const formatNumber = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  const fixed = value.toFixed(2);
  return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};

export const WateringHistory: React.FC<WateringHistoryProps> = ({ logs, onEdit, onDelete }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  if (!logs.length) {
    return (
      <ThemedView style={[styles.emptyCard, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
        <ThemedText style={[styles.emptyText, { color: palette.muted }]}>No waterings logged yet. Tap “Log watering” to add one.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.list}>
      {logs.map(log => {
        const stage = FEEDING_STAGE_LOOKUP[log.stageId];
        const formattedPh = formatNumber(log.ph);
        const formattedEc = formatNumber(log.ec);
        const headerParts = [`${log.waterLiters} L`, `${log.strength}% strength`];
        if (formattedPh) {
          headerParts.push(`pH ${formattedPh}`);
        }
        if (formattedEc) {
          headerParts.push(`EC ${formattedEc} mS/cm`);
        }
        const additives = log.additives ?? {};
        return (
          <ThemedView
            key={log.id}
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <ThemedText type="subtitle">{formatDate(log.createdAt)}</ThemedText>
                <ThemedText style={[styles.headerMeta, { color: palette.muted }]}>
                  {headerParts.join(' · ')}
                </ThemedText>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionButton, { borderColor: palette.border }]}
                  onPress={() => onEdit(log)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Edit watering log">
                  <ThemedText style={styles.actionLabel}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, { borderColor: palette.border }]}
                  onPress={() => onDelete(log)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Delete watering log">
                  <ThemedText style={[styles.actionLabel, { color: palette.danger }]}>Delete</ThemedText>
                </Pressable>
              </View>
            </View>
            <ThemedText style={[styles.stageLabel, { color: palette.muted }]}>{stage?.name ?? log.stageId}</ThemedText>
            <View style={styles.doseList}>
              {log.fertilizers.map(dose => (
                <View key={dose.fertilizer} style={styles.doseRow}>
                  <View style={styles.doseLabel}>
                    <ThemedText type="defaultSemiBold" style={styles.doseName}>
                      {dose.label}
                    </ThemedText>
                    <ThemedText style={[styles.dosePerLiter, { color: palette.muted }]}>{formatMl(dose.mlPerLiter)} per L</ThemedText>
                  </View>
                  <ThemedText type="title" style={styles.doseAmount}>
                    {formatMl(dose.ml)}
                  </ThemedText>
                </View>
              ))}
            </View>
            {additives.rootStimulant || additives.fulvicAcid || additives.bloomBooster ? (
              <View style={[styles.additiveSection, { borderTopColor: palette.border }]}> 
                <ThemedText type="defaultSemiBold">Additives</ThemedText>
                {additives.rootStimulant ? (
                  <ThemedText style={[styles.additiveCopy, { color: palette.muted }]}>
                    Root stimulant: {formatMl(additives.rootStimulant.mlPerLiter)} per L ·{' '}
                    {formatMl(additives.rootStimulant.totalMl)} total
                  </ThemedText>
                ) : null}
                {additives.fulvicAcid ? (
                  <ThemedText style={[styles.additiveCopy, { color: palette.muted }]}>
                    Fulvic acid: {formatMl(additives.fulvicAcid.mlPerLiter)} per L ·{' '}
                    {formatMl(additives.fulvicAcid.totalMl)} total
                  </ThemedText>
                ) : null}
                {additives.bloomBooster ? (
                  <ThemedText style={[styles.additiveCopy, { color: palette.muted }]}>
                    Bloom stimulant: {additives.bloomBooster.intensity}% →
                    {' '}
                    {formatMl(additives.bloomBooster.mlPerLiter)} per L · {formatMl(additives.bloomBooster.totalMl)} total
                  </ThemedText>
                ) : null}
              </View>
            ) : null}
          </ThemedView>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  headerMeta: {
    fontSize: 12,
    opacity: 0.75,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 12,
  },
  stageLabel: {
    fontSize: 13,
    opacity: 0.85,
  },
  doseList: {
    gap: 12,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doseLabel: {
    flex: 1,
    paddingRight: 12,
  },
  doseName: {
    textTransform: 'capitalize',
  },
  dosePerLiter: {
    fontSize: 12,
    marginTop: 2,
  },
  doseAmount: {
    minWidth: 72,
    textAlign: 'right',
  },
  additiveSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 4,
  },
  additiveCopy: {
    fontSize: 12,
    opacity: 0.85,
  },
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
