import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AdditiveCard } from '@/components/additive-card';
import { FertilizerSummary } from '@/components/fertilizer-summary';
import { NumberInput } from '@/components/number-input';
import { StagePicker } from '@/components/stage-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BLOOM_BOOSTER_RECOMMENDATIONS } from '@/constants/feeding';
import { Colors } from '@/constants/theme';
import { FeedingStageId, PlantState, WateringLogEntry } from '@/types/plant';
import { AdditiveDoseSummary, FertilizerDose, formatMl } from '@/utils/feeding';

interface WateringLogFormProps {
  draftPlant?: PlantState;
  isCompact: boolean;
  colorScheme: 'light' | 'dark';
  palette: typeof Colors.light;
  editingLog: WateringLogEntry | null;
  formStage: FeedingStageId;
  formStrength: number;
  formWater: number;
  formPh: number;
  formEc: number;
  liters: number;
  doses: FertilizerDose[];
  additiveDoses: AdditiveDoseSummary;
  totalMl: number;
  isEditing: boolean;
  onStageChange: (stage: FeedingStageId) => void;
  onStrengthChange: (value: number) => void;
  onWaterChange: (value: number) => void;
  onPhChange: (value: number) => void;
  onEcChange: (value: number) => void;
  onToggleRoot: (next: boolean) => void;
  onToggleFulvic: (next: boolean) => void;
  onAdjustBloom: (intensity: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function WateringLogForm({
  draftPlant,
  isCompact,
  colorScheme,
  palette,
  editingLog,
  formStage,
  formStrength,
  formWater,
  formPh,
  formEc,
  liters,
  doses,
  additiveDoses,
  totalMl,
  isEditing,
  onStageChange,
  onStrengthChange,
  onWaterChange,
  onPhChange,
  onEcChange,
  onToggleRoot,
  onToggleFulvic,
  onAdjustBloom,
  onSubmit,
  onCancel,
}: WateringLogFormProps) {
  return (
    <ScrollView contentContainerStyle={[styles.scroll, isCompact && styles.scrollCompact]}>
      {isEditing && editingLog ? (
        <ThemedText style={[styles.editingBanner, { backgroundColor: palette.accentSoft, color: palette.accent }]}>
          Editing log from {new Date(editingLog.createdAt).toLocaleDateString()} at{' '}
          {new Date(editingLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
      ) : null}

      <View style={styles.section}>
        <StagePicker value={formStage} onChange={onStageChange} />
        <NumberInput
          label="Strength"
          unit="%"
          value={formStrength}
          minimum={40}
          maximum={110}
          step={5}
          onChange={onStrengthChange}
        />
        <NumberInput
          label="Water volume"
          unit="L"
          value={formWater}
          minimum={0.5}
          step={0.5}
          onChange={onWaterChange}
        />
        <ThemedText style={[styles.helperCopy, { color: palette.muted }]}>The strength slider multiplies the base feeding chart. 100% equals the published Terra Aquatica schedule.</ThemedText>
      </View>

      <FertilizerSummary doses={doses} waterLiters={liters} />

      {draftPlant ? (
        <AdditiveCard
          plant={draftPlant}
          doses={additiveDoses}
          waterLiters={liters}
          onToggleRoot={onToggleRoot}
          onToggleFulvic={onToggleFulvic}
          onAdjustBloom={onAdjustBloom}
        />
      ) : null}

      <ThemedView
        style={[styles.tipCard, { backgroundColor: palette.primarySoft, borderColor: palette.primary }]}
        lightColor={palette.primarySoft}
        darkColor={palette.primarySoft}>
        <ThemedText type="subtitle">Bloom game plan</ThemedText>
        <ThemedText style={[styles.tipCopy, { color: palette.primary }]}>
          Suggested bloom stimulant intensity for {formStage} is {BLOOM_BOOSTER_RECOMMENDATIONS[formStage]}%. Keep an eye on leaf tips—dial back 5% if you see light burn, or add 5% when plants are hungry.
        </ThemedText>
      </ThemedView>

      <View style={[styles.section, styles.measureSection]}>
        <NumberInput label="pH" value={formPh} minimum={0} maximum={14} step={0.1} onChange={onPhChange} />
        <NumberInput label="EC" unit="mS/cm" value={formEc} minimum={0} step={0.1} onChange={onEcChange} />
      </View>

      <Pressable
        style={[
          styles.logButton,
          {
            backgroundColor: palette.accent,
            shadowColor: palette.accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: colorScheme === 'light' ? 0.25 : 0.4,
            shadowRadius: 12,
            elevation: 4,
          },
          isCompact && styles.logButtonCompact,
        ]}
        onPress={onSubmit}
        accessibilityRole="button">
        <ThemedText
          type={isCompact ? 'defaultSemiBold' : 'title'}
          lightColor="#FFFFFF"
          darkColor={Colors.dark.background}
          style={[styles.logButtonLabel, isCompact && styles.logButtonLabelCompact]}>
          {isEditing ? 'Save changes' : 'Log watering'} ({liters} L · {formStrength}% · {formatMl(totalMl)} nutrients)
        </ThemedText>
      </Pressable>

      <View style={[styles.logActions, isCompact && styles.logActionsCompact]}>
        <Pressable
          style={[styles.cancelButton, { borderColor: palette.border }, isCompact && styles.cancelButtonCompact]}
          onPress={onCancel}
          accessibilityRole="button">
          <ThemedText type="defaultSemiBold" style={{ color: palette.text }}>
            Cancel
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  scrollCompact: {
    paddingBottom: 80,
  },
  section: {
    marginTop: 12,
    gap: 8,
  },
  helperCopy: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 12,
  },
  tipCard: {
    marginTop: 24,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
  },
  tipCopy: {
    opacity: 0.85,
    fontSize: 13,
  },
  measureSection: {
    marginTop: 24,
  },
  logButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    marginTop: 24,
  },
  logButtonCompact: {
    paddingVertical: 12,
    borderRadius: 16,
  },
  logButtonLabel: {
    textAlign: 'center',
  },
  logButtonLabelCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  logActions: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logActionsCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexShrink: 0,
  },
  cancelButtonCompact: {
    width: '100%',
  },
  editingBanner: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
});
