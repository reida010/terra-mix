import React from 'react';
import { Pressable, StyleSheet, View, type PressableStateCallbackType } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { withAlpha } from '@/utils/color';
import { FEEDING_STAGE_LOOKUP, FULVIC_ACID_DEFAULT_INTENSITY } from '@/constants/feeding';
import { PlantState } from '@/types/plant';

interface PlantInfoProps {
  plant: PlantState;
  palette: typeof Colors.light;
  isCompact: boolean;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function PlantInfo({ plant, palette, isCompact, onRename, onArchive, onDelete }: PlantInfoProps) {
  const stage = FEEDING_STAGE_LOOKUP[plant.stageId];
  const latestLog = plant.logs[0];
  const lastWatered = latestLog ? new Date(latestLog.createdAt) : null;
  const formatAdditiveStatus = (active: boolean, description: string, suffix?: string) =>
    active ? (suffix ? `${description} · ${suffix}` : description) : 'Inactive';

  const fulvicIntensity = plant.additives.fulvicAcid.intensity ?? FULVIC_ACID_DEFAULT_INTENSITY;
  const fulvicIntensityLabel = `${fulvicIntensity.toLocaleString(undefined, { maximumFractionDigits: 0 })}%`;

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      <View style={[styles.card, { borderColor: palette.border, backgroundColor: palette.surface }]}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Plant details
        </ThemedText>
        <DetailRow label="Stage" value={stage?.name ?? plant.stageId} palette={palette} />
        <DetailRow label="Strength" value={`${Math.round(plant.strength)}%`} palette={palette} />
        <DetailRow
          label="Last watered"
          value={lastWatered ? lastWatered.toLocaleDateString() : 'No waterings logged yet'}
          palette={palette}
        />
        <View style={styles.additivesGroup}>
          <ThemedText type="defaultSemiBold" style={styles.additivesHeader}>
            Additives
          </ThemedText>
          <DetailRow
            label="Root stimulant"
            value={formatAdditiveStatus(
              plant.additives.rootStimulant.active,
              'Active'
            )}
            palette={palette}
          />
          <DetailRow
            label="Fulvic acid"
            value={formatAdditiveStatus(plant.additives.fulvicAcid.active, 'Active', fulvicIntensityLabel)}
            palette={palette}
          />
          <DetailRow
            label="Bloom booster"
            value={
              plant.additives.bloomBooster.active
                ? `${Math.round(plant.additives.bloomBooster.intensity)}% intensity`
                : 'Inactive'
            }
            palette={palette}
          />
        </View>
      </View>

      <View
        style={[
          styles.card,
          styles.actionsCard,
          { borderColor: palette.border, backgroundColor: palette.surface },
        ]}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Plant actions
        </ThemedText>
        <ActionButton
          label="Rename plant"
          onPress={onRename}
          palette={palette}
          accessibilityLabel={`Rename ${plant.name}`}
        />
        <ActionButton
          label="Archive plant"
          onPress={onArchive}
          palette={palette}
          accessibilityLabel={`Archive ${plant.name}`}
        />
        <ActionButton
          label="Delete plant"
          onPress={onDelete}
          palette={palette}
          tone="destructive"
          accessibilityLabel={`Delete ${plant.name}`}
        />
      </View>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  palette: typeof Colors.light;
}

function DetailRow({ label, value, palette }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="defaultSemiBold" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.detailValue, { color: palette.text }]}>{value}</ThemedText>
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  palette: typeof Colors.light;
  tone?: 'default' | 'destructive';
  accessibilityLabel: string;
  onPress: () => void;
}

function ActionButton({ label, palette, tone = 'default', accessibilityLabel, onPress }: ActionButtonProps) {
  const isDestructive = tone === 'destructive';
  const textColor = isDestructive ? palette.danger : palette.text;
  const borderColor = isDestructive ? palette.danger : palette.border;
  const baseBackground = isDestructive ? withAlpha(palette.danger, 0.08) : palette.surfaceMuted;
  const hoverBackground = isDestructive ? withAlpha(palette.danger, 0.16) : palette.surface;
  const activeBackground = isDestructive ? withAlpha(palette.danger, 0.24) : palette.primarySoft;

  const resolveBackground = ({ hovered, pressed }: PressableStateCallbackType) => {
    if (pressed) {
      return activeBackground;
    }
    if (hovered) {
      return hoverBackground;
    }
    return baseBackground;
  };

  return (
    <Pressable
      style={({ hovered, pressed }) => [
        styles.actionButton,
        {
          borderColor,
          backgroundColor: resolveBackground({ hovered, pressed }),
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <ThemedText type="defaultSemiBold" style={[styles.actionLabel, { color: textColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  containerCompact: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  additivesGroup: {
    marginTop: 4,
    gap: 8,
  },
  additivesHeader: {
    fontSize: 14,
  },
  actionsCard: {
    gap: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionLabel: {
    textAlign: 'center',
  },
});
