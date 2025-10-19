import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
  if (!logs.length) {
    return (
      <ThemedView style={styles.emptyCard}>
        <ThemedText style={styles.emptyText}>No waterings logged yet. Tap “Log watering” to add one.</ThemedText>
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
          <ThemedView key={log.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <ThemedText type="subtitle">{formatDate(log.createdAt)}</ThemedText>
                <ThemedText style={styles.headerMeta}>
                  {headerParts.join(' · ')}
                </ThemedText>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onEdit(log)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Edit watering log">
                  <ThemedText style={styles.actionLabel}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onDelete(log)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Delete watering log">
                  <ThemedText style={[styles.actionLabel, styles.deleteLabel]}>Delete</ThemedText>
                </Pressable>
              </View>
            </View>
            <ThemedText style={styles.stageLabel}>{stage?.name ?? log.stageId}</ThemedText>
            <View style={styles.doseList}>
              {log.fertilizers.map(dose => (
                <View key={dose.fertilizer} style={styles.doseRow}>
                  <View style={styles.doseLabel}>
                    <ThemedText type="defaultSemiBold" style={styles.doseName}>
                      {dose.label}
                    </ThemedText>
                    <ThemedText style={styles.dosePerLiter}>{formatMl(dose.mlPerLiter)} per L</ThemedText>
                  </View>
                  <ThemedText type="title" style={styles.doseAmount}>
                    {formatMl(dose.ml)}
                  </ThemedText>
                </View>
              ))}
            </View>
            {additives.rootStimulant || additives.fulvicAcid || additives.bloomBooster ? (
              <View style={styles.additiveSection}>
                <ThemedText type="defaultSemiBold">Additives</ThemedText>
                {additives.rootStimulant ? (
                  <ThemedText style={styles.additiveCopy}>
                    Root stimulant: {formatMl(additives.rootStimulant.mlPerLiter)} per L ·{' '}
                    {formatMl(additives.rootStimulant.totalMl)} total
                  </ThemedText>
                ) : null}
                {additives.fulvicAcid ? (
                  <ThemedText style={styles.additiveCopy}>
                    Fulvic acid: {formatMl(additives.fulvicAcid.mlPerLiter)} per L ·{' '}
                    {formatMl(additives.fulvicAcid.totalMl)} total
                  </ThemedText>
                ) : null}
                {additives.bloomBooster ? (
                  <ThemedText style={styles.additiveCopy}>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  actionLabel: {
    fontSize: 12,
  },
  deleteLabel: {
    color: '#f87171',
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
    opacity: 0.7,
    marginTop: 2,
  },
  doseAmount: {
    minWidth: 72,
    textAlign: 'right',
  },
  additiveSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.3)',
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
  },
  emptyText: {
    fontSize: 13,
    opacity: 0.8,
    textAlign: 'center',
  },
});
