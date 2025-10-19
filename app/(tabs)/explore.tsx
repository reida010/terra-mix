import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FERTILIZER_LABELS, FEEDING_STAGES, ROOT_STIMULANT_DEFAULT_DURATION } from '@/constants/feeding';

const FERTILIZER_ORDER = ['grow', 'micro', 'bloom'] as const;

export default function ReferenceScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.heading}>
          Feeding reference
        </ThemedText>
        <ThemedText style={styles.intro}>
          Terra Aquatica&apos;s TriPart series shines when each part is nudged for the plant&apos;s phase. Use this overview to sense
          check the values that the calculator generates on the main tab.
        </ThemedText>

        {FEEDING_STAGES.map(stage => (
          <View key={stage.id} style={styles.card}>
            <ThemedText type="subtitle" style={styles.stageTitle}>
              {stage.name}
            </ThemedText>
            <ThemedText style={styles.stageDescription}>{stage.description}</ThemedText>
            <View style={styles.rateTable}>
              {FERTILIZER_ORDER.map(key => {
                const rate = stage.rates.find(entry => entry.fertilizer === key);
                if (!rate) return null;
                return (
                  <View key={key} style={styles.rateRow}>
                    <ThemedText type="defaultSemiBold">{FERTILIZER_LABELS[key]}</ThemedText>
                    <ThemedText>{rate.mlPerLiter} ml / L</ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.card}>
          <ThemedText type="subtitle">Additive habits</ThemedText>
          <View style={styles.bulletList}>
            <ThemedText style={styles.stageDescription}>
              • Root stimulant: run {ROOT_STIMULANT_DEFAULT_DURATION} days after transplant, then give roots a breather.
            </ThemedText>
            <ThemedText style={styles.stageDescription}>
              • Fulvic acid: keep it in the mix through veg. The app parks it automatically once you flip to bloom.
            </ThemedText>
            <ThemedText style={styles.stageDescription}>
              • Bloom booster: ease in around preflower, peak mid bloom, then feather off for ripening.
            </ThemedText>
          </View>
        </View>

        <View style={[styles.card, styles.tipCard]}>
          <ThemedText type="subtitle">Quick mixing tips</ThemedText>
          <ThemedText style={styles.tipText}>
            Always add Micro to the water first so calcium doesn&apos;t lock out. Follow with Grow, then Bloom, stirring between
            additions. pH after the nutrients go in, and remix if the solution sits for more than 24 hours.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  heading: {
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    opacity: 0.85,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  stageTitle: {
    textTransform: 'capitalize',
  },
  stageDescription: {
    fontSize: 13,
    opacity: 0.85,
  },
  rateTable: {
    gap: 8,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bulletList: {
    gap: 4,
  },
  tipCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
