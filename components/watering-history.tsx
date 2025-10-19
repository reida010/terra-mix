import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FEEDING_STAGE_LOOKUP } from '@/constants/feeding';
import { WateringLogEntry } from '@/types/plant';
import { formatMl } from '@/utils/feeding';

interface WateringHistoryProps {
  logs: WateringLogEntry[];
}

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const WateringHistory: React.FC<WateringHistoryProps> = ({ logs }) => {
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
        return (
          <ThemedView key={log.id} style={styles.card}>
            <View style={styles.headerRow}>
              <ThemedText type="subtitle">{formatDate(log.createdAt)}</ThemedText>
              <ThemedText style={styles.headerMeta}>
                {log.waterLiters} L · {log.strength}% strength
              </ThemedText>
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
            {log.additives.rootStimulant || log.additives.fulvicAcid || log.additives.bloomBooster ? (
              <View style={styles.additiveSection}>
                <ThemedText type="defaultSemiBold">Additives</ThemedText>
                {log.additives.rootStimulant ? (
                  <ThemedText style={styles.additiveCopy}>
                    Root stimulant: {formatMl(log.additives.rootStimulant.mlPerLiter)} per L ·{' '}
                    {formatMl(log.additives.rootStimulant.totalMl)} total
                  </ThemedText>
                ) : null}
                {log.additives.fulvicAcid ? (
                  <ThemedText style={styles.additiveCopy}>
                    Fulvic acid: {formatMl(log.additives.fulvicAcid.mlPerLiter)} per L ·{' '}
                    {formatMl(log.additives.fulvicAcid.totalMl)} total
                  </ThemedText>
                ) : null}
                {log.additives.bloomBooster ? (
                  <ThemedText style={styles.additiveCopy}>
                    Bloom stimulant: {log.additives.bloomBooster.intensity}% →
                    {' '}
                    {formatMl(log.additives.bloomBooster.mlPerLiter)} per L · {formatMl(log.additives.bloomBooster.totalMl)} total
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
    alignItems: 'center',
  },
  headerMeta: {
    fontSize: 12,
    opacity: 0.75,
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
