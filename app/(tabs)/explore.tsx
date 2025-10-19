import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FERTILIZER_LABELS, FEEDING_STAGES, ROOT_STIMULANT_DEFAULT_DURATION } from '@/constants/feeding';

const FERTILIZER_ORDER = ['grow', 'micro', 'bloom'] as const;

export default function ReferenceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.heading}>
          Feeding reference
        </ThemedText>
        <ThemedText style={[styles.intro, { color: palette.muted }]}>
          Terra Aquatica&apos;s TriPart series shines when each part is nudged for the plant&apos;s phase. Use this overview to sense
          check the values that the calculator generates on the main tab.
        </ThemedText>

        {FEEDING_STAGES.map(stage => (
          <ThemedView
            key={stage.id}
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <ThemedText type="subtitle" style={styles.stageTitle}>
              {stage.name}
            </ThemedText>
            <ThemedText style={[styles.stageDescription, { color: palette.muted }]}>{stage.description}</ThemedText>
            <View style={styles.rateTable}>
              {FERTILIZER_ORDER.map(key => {
                const rate = stage.rates.find(entry => entry.fertilizer === key);
                if (!rate) return null;
                return (
                  <View key={key} style={styles.rateRow}>
                    <ThemedText type="defaultSemiBold">{FERTILIZER_LABELS[key]}</ThemedText>
                    <ThemedText style={{ color: palette.primary }}>{rate.mlPerLiter} ml / L</ThemedText>
                  </View>
                );
              })}
            </View>
          </ThemedView>
        ))}

        <ThemedView style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <ThemedText type="subtitle">Additive habits</ThemedText>
          <View style={styles.bulletList}>
            <ThemedText style={[styles.stageDescription, { color: palette.muted }]}>
              • Root stimulant: run {ROOT_STIMULANT_DEFAULT_DURATION} days after transplant, then give roots a breather.
            </ThemedText>
            <ThemedText style={[styles.stageDescription, { color: palette.muted }]}>
              • Fulvic acid: keep it in the mix through veg. The app parks it automatically once you flip to bloom.
            </ThemedText>
            <ThemedText style={[styles.stageDescription, { color: palette.muted }]}>
              • Bloom booster: ease in around preflower, peak mid bloom, then feather off for ripening.
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView
          style={[styles.card, styles.tipCard, { backgroundColor: palette.primarySoft, borderColor: palette.primary }]}
          lightColor={palette.primarySoft}
          darkColor={palette.primarySoft}>
          <ThemedText type="subtitle">Quick mixing tips</ThemedText>
          <ThemedText style={[styles.tipText, { color: palette.primary }]}>
            Always add Micro to the water first so calcium doesn&apos;t lock out. Follow with Grow, then Bloom, stirring between
            additions. pH after the nutrients go in, and remix if the solution sits for more than 24 hours.
          </ThemedText>
        </ThemedView>
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
    borderWidth: 1,
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
    borderWidth: 1,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
