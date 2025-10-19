import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FertilizerDose, formatMl } from '@/utils/feeding';

interface FertilizerSummaryProps {
  doses: FertilizerDose[];
  waterLiters: number;
}

export const FertilizerSummary: React.FC<FertilizerSummaryProps> = ({ doses, waterLiters }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ThemedView style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <ThemedText type="title">Fertilizer mix</ThemedText>
      <ThemedText style={[styles.subtitle, { color: palette.muted }]}>For {waterLiters} L of solution</ThemedText>
      <View style={styles.table}>
        {doses.map(dose => (
          <View key={dose.fertilizer} style={styles.row}>
            <View style={styles.cellLabel}>
              <ThemedText type="subtitle" style={styles.name}>
                {dose.label}
              </ThemedText>
              <ThemedText style={[styles.perLiter, { color: palette.muted }]}>{formatMl(dose.mlPerLiter)} per L</ThemedText>
            </View>
            <ThemedText type="title" style={styles.amount}>
              {formatMl(dose.ml)}
            </ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
    marginTop: 16,
    borderWidth: 1,
  },
  subtitle: {
    opacity: 0.75,
  },
  table: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellLabel: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    textTransform: 'capitalize',
  },
  perLiter: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    minWidth: 80,
    textAlign: 'right',
  },
});
