import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FertilizerDose, formatMl } from '@/utils/feeding';

interface FertilizerSummaryProps {
  doses: FertilizerDose[];
  waterLiters: number;
}

export const FertilizerSummary: React.FC<FertilizerSummaryProps> = ({ doses, waterLiters }) => {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="title">Fertilizer mix</ThemedText>
      <ThemedText style={styles.subtitle}>For {waterLiters} L of solution</ThemedText>
      <View style={styles.table}>
        {doses.map(dose => (
          <View key={dose.fertilizer} style={styles.row}>
            <View style={styles.cellLabel}>
              <ThemedText type="subtitle" style={styles.name}>
                {dose.label}
              </ThemedText>
              <ThemedText style={styles.perLiter}>{formatMl(dose.mlPerLiter)} per L</ThemedText>
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
    opacity: 0.7,
    marginTop: 2,
  },
  amount: {
    minWidth: 80,
    textAlign: 'right',
  },
});
