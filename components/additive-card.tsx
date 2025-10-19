import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  BLOOM_BOOSTER_RECOMMENDATIONS,
  BLOOM_BOOSTER_MAX_ML_PER_L,
  FULVIC_ACID_DEFAULT_DOSAGE,
  ROOT_STIMULANT_DEFAULT_DURATION,
  ROOT_STIMULANT_DEFAULT_DOSAGE,
} from '@/constants/feeding';
import { PlantState } from '@/types/plant';
import { differenceInDays } from '@/utils/dates';
import { AdditiveDoseSummary, formatMl } from '@/utils/feeding';

interface AdditiveCardProps {
  plant: PlantState;
  waterLiters: number;
  doses: AdditiveDoseSummary;
  onToggleRoot: (next: boolean) => void;
  onToggleFulvic: (next: boolean) => void;
  onAdjustBloom: (intensity: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const AdditiveCard: React.FC<AdditiveCardProps> = ({ plant, onToggleRoot, onToggleFulvic, onAdjustBloom, waterLiters, doses }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const stageId = plant.stageId;
  const allowsRoot = stageId === 'seedling' || stageId === 'earlyGrow' || stageId === 'grow';
  const allowsFulvic = allowsRoot || stageId === 'preflower';
  const allowsBloom = stageId === 'preflower' || stageId === 'flower' || stageId === 'lateFlower' || stageId === 'ripen';
  const rootDaysRemaining = useMemo(() => {
    if (!plant.additives.rootStimulant.active || !plant.additives.rootStimulant.startDate) {
      return plant.additives.rootStimulant.durationDays;
    }
    const elapsed = differenceInDays(plant.additives.rootStimulant.startDate);
    return Math.max(plant.additives.rootStimulant.durationDays - elapsed, 0);
  }, [plant.additives.rootStimulant]);

  const liters = Math.max(waterLiters, 0);
  const bloomRecommendation = BLOOM_BOOSTER_RECOMMENDATIONS[plant.stageId] ?? 0;
  const rootDose = doses.rootStimulant;
  const fulvicDose = doses.fulvicAcid;
  const bloomDose = doses.bloomBooster;

  const rootDefault = plant.additives.rootStimulant.dosageMlPerLiter || ROOT_STIMULANT_DEFAULT_DOSAGE;
  const rootActive = plant.additives.rootStimulant.active;
  const rootMlPerLiter = rootActive ? rootDose?.mlPerLiter ?? rootDefault : rootDefault;
  const rootTotal = rootActive
    ? rootDose?.totalMl ?? rootMlPerLiter * liters
    : rootDefault * liters;

  const fulvicDefault = plant.additives.fulvicAcid.dosageMlPerLiter || FULVIC_ACID_DEFAULT_DOSAGE;
  const fulvicActive = plant.additives.fulvicAcid.active;
  const fulvicMlPerLiter = fulvicActive ? fulvicDose?.mlPerLiter ?? fulvicDefault : fulvicDefault;
  const fulvicTotal = fulvicActive
    ? fulvicDose?.totalMl ?? fulvicMlPerLiter * liters
    : fulvicDefault * liters;

  const bloomIntensity = plant.additives.bloomBooster.intensity;
  const bloomActive = plant.additives.bloomBooster.active || bloomIntensity > 0;
  const bloomMlPerLiter = bloomActive
    ? bloomDose?.mlPerLiter ?? (bloomIntensity / 100) * BLOOM_BOOSTER_MAX_ML_PER_L
    : (bloomRecommendation / 100) * BLOOM_BOOSTER_MAX_ML_PER_L;
  const bloomTotal = bloomActive
    ? bloomDose?.totalMl ?? bloomMlPerLiter * liters
    : (bloomRecommendation / 100) * BLOOM_BOOSTER_MAX_ML_PER_L * liters;

  return (
    <View style={styles.container}>
      <ThemedText type="title">Additives</ThemedText>
      {allowsRoot ? (
        <ThemedView style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
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
              onPress={() => onToggleRoot(!plant.additives.rootStimulant.active)}
              style={[
                styles.toggle,
                {
                  backgroundColor: plant.additives.rootStimulant.active ? palette.accent : palette.surfaceMuted,
                  borderColor: plant.additives.rootStimulant.active ? palette.accent : palette.border,
                },
              ]}>
              <View
                style={[
                  styles.knob,
                  { backgroundColor: colorScheme === 'light' ? '#fff' : palette.surface },
                  plant.additives.rootStimulant.active && styles.knobActive,
                ]}
              />
            </Pressable>
          </View>
          <ThemedText style={styles.helperText}>
            Keeps roots happy after transplant. Automatically counts down a {ROOT_STIMULANT_DEFAULT_DURATION}-day cycle.
          </ThemedText>
          <View style={styles.doseTable}>
            <View style={styles.doseRow}>
              <View style={styles.doseLabel}>
                <ThemedText type="defaultSemiBold" style={styles.doseName}>
                  {rootActive ? 'Current dosage' : 'Recommended dosage'}
                </ThemedText>
                <ThemedText style={styles.dosePerLiter}>{formatMl(rootMlPerLiter)} per L</ThemedText>
              </View>
              <ThemedText type="title" style={[styles.doseAmount, !rootActive && styles.doseAmountMuted]}>
                {formatMl(rootTotal)}
              </ThemedText>
            </View>
          </View>
          {!rootActive ? (
            <ThemedText style={styles.helperMuted}>Toggle on to add it to your mix.</ThemedText>
          ) : null}
        </ThemedView>
      ) : null}

      {allowsFulvic ? (
        <ThemedView style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
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
              style={[
                styles.toggle,
                {
                  backgroundColor: plant.additives.fulvicAcid.active ? palette.accent : palette.surfaceMuted,
                  borderColor: plant.additives.fulvicAcid.active ? palette.accent : palette.border,
                },
              ]}>
              <View
                style={[
                  styles.knob,
                  { backgroundColor: colorScheme === 'light' ? '#fff' : palette.surface },
                  plant.additives.fulvicAcid.active && styles.knobActive,
                ]}
              />
            </Pressable>
          </View>
          <ThemedText style={styles.helperText}>
            Use through vegetative growth. The app will automatically stop it once you enter full bloom.
          </ThemedText>
          <View style={styles.doseTable}>
            <View style={styles.doseRow}>
              <View style={styles.doseLabel}>
                <ThemedText type="defaultSemiBold" style={styles.doseName}>
                  {fulvicActive ? 'Current dosage' : 'Recommended dosage'}
                </ThemedText>
                <ThemedText style={styles.dosePerLiter}>{formatMl(fulvicMlPerLiter)} per L</ThemedText>
              </View>
              <ThemedText type="title" style={[styles.doseAmount, !fulvicActive && styles.doseAmountMuted]}>
                {formatMl(fulvicTotal)}
              </ThemedText>
            </View>
          </View>
          {!fulvicActive ? (
            <ThemedText style={styles.helperMuted}>Enable to include it in the watering log.</ThemedText>
          ) : null}
        </ThemedView>
      ) : null}

      {allowsBloom ? (
        <ThemedView style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
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
          <View style={styles.doseTable}>
            <View style={styles.doseRow}>
              <View style={styles.doseLabel}>
                <ThemedText type="defaultSemiBold" style={styles.doseName}>
                  {bloomActive ? `${bloomIntensity}% intensity` : `${bloomRecommendation}% recommended`}
                </ThemedText>
                <ThemedText style={styles.dosePerLiter}>{formatMl(bloomMlPerLiter)} per L</ThemedText>
              </View>
              <ThemedText type="title" style={[styles.doseAmount, !bloomActive && styles.doseAmountMuted]}>
                {formatMl(bloomTotal)}
              </ThemedText>
            </View>
          </View>
          <View style={styles.bloomRow}>
            <Pressable
              style={[styles.roundButton, { borderColor: palette.border, backgroundColor: palette.surfaceMuted }]}
              onPress={() => onAdjustBloom(clamp(plant.additives.bloomBooster.intensity - 5, 0, 100))}>
              <ThemedText type="default" lightColor={palette.primary} darkColor={palette.accent}>
                -
              </ThemedText>
            </Pressable>
            <ThemedText type="title" style={styles.bloomValue}>
              {plant.additives.bloomBooster.intensity}%
            </ThemedText>
            <Pressable
              style={[styles.roundButton, { borderColor: palette.border, backgroundColor: palette.surfaceMuted }]}
              onPress={() => onAdjustBloom(clamp(plant.additives.bloomBooster.intensity + 5, 0, 100))}>
              <ThemedText type="default" lightColor={palette.primary} darkColor={palette.accent}>
                +
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      ) : null}
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
    borderWidth: 1,
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
  helperMuted: {
    fontSize: 12,
    opacity: 0.7,
  },
  doseTable: {
    marginTop: 4,
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
    opacity: 0.75,
    marginTop: 2,
  },
  doseAmount: {
    minWidth: 72,
    textAlign: 'right',
  },
  doseAmountMuted: {
    opacity: 0.6,
  },
  toggle: {
    width: 46,
    height: 28,
    borderRadius: 20,
    padding: 3,
    justifyContent: 'center',
    borderWidth: 1,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    borderWidth: 1,
  },
});
