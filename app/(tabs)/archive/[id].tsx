import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WateringHistory } from '@/components/watering-history';
import { FEEDING_STAGE_LOOKUP } from '@/constants/feeding';
import { Colors } from '@/constants/theme';
import { usePlants } from '@/context/PlantContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMl } from '@/utils/feeding';

const formatDate = (iso?: string) => {
  if (!iso) return 'Unknown date';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString();
};

export default function ArchivedPlantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const plantId = Array.isArray(id) ? id[0] : id;
  const { plants } = usePlants();
  const plant = useMemo(
    () => plants.find(p => p.id === plantId && Boolean(p.archivedAt)),
    [plants, plantId]
  );
  const stage = plant ? FEEDING_STAGE_LOOKUP[plant.stageId] : undefined;
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const lastLog = plant?.logs[0];
  const totalMl = lastLog ? lastLog.fertilizers.reduce((sum, dose) => sum + dose.ml, 0) : 0;

  return (
    <>
      <Stack.Screen options={{ title: plant?.name ?? 'Archived plant' }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['bottom']}>
        {!plant ? (
          <View style={styles.emptyState}>
            <ThemedText type="title">Plant not found</ThemedText>
            <ThemedText style={[styles.emptyCopy, { color: palette.muted }]}>This archived plant could not be located.</ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedView
              style={[
                styles.summaryCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}>
              <View style={styles.summaryHeader}>
                <ThemedText type="title">{plant.name}</ThemedText>
                <ThemedText style={[styles.summaryMeta, { color: palette.muted }]}>
                  Archived {formatDate(plant.archivedAt)} · Stage {stage?.name ?? plant.stageId}
                </ThemedText>
              </View>
              {lastLog ? (
                <View style={styles.summaryRow}>
                  <ThemedText style={[styles.summaryLabel, { color: palette.muted }]}>Last watering</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: palette.text }]}>
                    {formatDate(lastLog.createdAt)} · {lastLog.waterLiters} L · {lastLog.strength}% · {formatMl(totalMl)} nutrients
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={[styles.summaryValue, { color: palette.muted }]}>No waterings logged yet.</ThemedText>
              )}
            </ThemedView>
            <View style={styles.historySection}>
              <ThemedText type="title" style={{ color: palette.text }}>
                Watering history
              </ThemedText>
              <WateringHistory logs={plant.logs} emptyMessage="No waterings logged yet." />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  summaryHeader: {
    gap: 6,
  },
  summaryMeta: {
    fontSize: 12,
    opacity: 0.75,
  },
  summaryRow: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 13,
    opacity: 0.85,
  },
  historySection: {
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyCopy: {
    textAlign: 'center',
  },
});
