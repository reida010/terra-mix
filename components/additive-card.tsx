import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BLOOM_BOOSTER_RECOMMENDATIONS, ROOT_STIMULANT_DEFAULT_DURATION } from '@/constants/feeding';
import { PlantState } from '@/types/plant';
import { differenceInDays } from '@/utils/dates';

interface AdditiveCardProps {
  plant: PlantState;
  onToggleRoot: (next: boolean) => void;
  onToggleFulvic: (next: boolean) => void;
  onAdjustBloom: (intensity: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const AdditiveCard: React.FC<AdditiveCardProps> = ({ plant, onToggleRoot, onToggleFulvic, onAdjustBloom }) => {
  const rootDaysRemaining = useMemo(() => {
    if (!plant.additives.rootStimulant.active || !plant.additives.rootStimulant.startDate) {
      return plant.additives.rootStimulant.durationDays;
    }
    const elapsed = differenceInDays(plant.additives.rootStimulant.startDate);
    return Math.max(plant.additives.rootStimulant.durationDays - elapsed, 0);
  }, [plant.additives.rootStimulant]);

  const bloomRecommendation = BLOOM_BOOSTER_RECOMMENDATIONS[plant.stageId] ?? 0;

  return (
    <View style={styles.container}>
      <ThemedText type="title">Additives</ThemedText>
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">Root Stimulant</ThemedText>
            <ThemedText style={styles.subtle}>
              {plant.additives.rootStimulant.active
                ? `${rootDaysRemaining} days remaining`
                : `Start ${ROOT_STIMULANT_DEFAULT_DURATION}-day run`}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: plant.additives.rootStimulant.active }}
            onPress={() =>
              onToggleRoot(!plant.additives.rootStimulant.active)
            }
            style={[styles.toggle, plant.additives.rootStimulant.active && styles.toggleActive]}>
            <View
              style={[styles.knob, plant.additives.rootStimulant.active && styles.knobActive]}
            />
          </Pressable>
        </View>
        <ThemedText style={styles.helperText}>
          Keeps roots happy after transplant. Automatically counts down a {ROOT_STIMULANT_DEFAULT_DURATION}-day cycle.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">Fulvic Acid</ThemedText>
            <ThemedText style={styles.subtle}>
              {plant.additives.fulvicAcid.active
                ? 'Active until bloom stage'
                : 'Enable after transplant for micronutrient uptake'}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: plant.additives.fulvicAcid.active }}
            onPress={() => onToggleFulvic(!plant.additives.fulvicAcid.active)}
            style={[styles.toggle, plant.additives.fulvicAcid.active && styles.toggleActive]}>
            <View style={[styles.knob, plant.additives.fulvicAcid.active && styles.knobActive]} />
          </Pressable>
        </View>
        <ThemedText style={styles.helperText}>
          Use through vegetative growth. The app will automatically stop it once you enter full bloom.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">Bloom Stimulant</ThemedText>
            <ThemedText style={styles.subtle}>
              Recommended: {bloomRecommendation}%
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.helperText}>
          Start gently in preflower, ramp up through bloom, then taper for ripening. Adjust the slider to match canopy response.
        </ThemedText>
        <View style={styles.bloomRow}>
          <Pressable
            style={styles.roundButton}
            onPress={() => onAdjustBloom(clamp(plant.additives.bloomBooster.intensity - 5, 0, 100))}>
            <ThemedText type="default">-</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.bloomValue}>
            {plant.additives.bloomBooster.intensity}%
          </ThemedText>
          <Pressable
            style={styles.roundButton}
            onPress={() => onAdjustBloom(clamp(plant.additives.bloomBooster.intensity + 5, 0, 100))}>
            <ThemedText type="default">+</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  subtle: {
    fontSize: 12,
    opacity: 0.75,
  },
  helperText: {
    fontSize: 13,
    opacity: 0.9,
  },
  toggle: {
    width: 46,
    height: 28,
    borderRadius: 20,
    padding: 3,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.65)',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
  },
  knobActive: {
    transform: [{ translateX: 16 }],
  },
  bloomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  bloomValue: {
    minWidth: 72,
    textAlign: 'center',
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.6)',
  },
});
