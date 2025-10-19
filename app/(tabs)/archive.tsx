import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FEEDING_STAGE_LOOKUP } from '@/constants/feeding';
import { usePlants } from '@/context/PlantContext';
import { PlantState } from '@/types/plant';
import { formatMl } from '@/utils/feeding';

const formatDate = (iso?: string) => {
  if (!iso) return 'Unknown date';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString();
};

export default function ArchiveScreen() {
  const { plants, archivePlant, deletePlant, updatePlant } = usePlants();
  const archivedPlants = useMemo(() => plants.filter(plant => Boolean(plant.archivedAt)), [plants]);
  const [pendingRename, setPendingRename] = useState<PlantState | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleRestore = (id: string) => {
    archivePlant(id, false);
  };

  const handleRename = (plant: PlantState) => {
    setPendingRename(plant);
    setRenameValue(plant.name);
  };

  const handleDelete = (id: string) => {
    const target = plants.find(p => p.id === id);
    Alert.alert(
      'Delete plant',
      target ? `Permanently delete ${target.name}? This cannot be undone.` : 'Permanently delete this plant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlant(id),
        },
      ]
    );
  };

  const handleConfirmRename = () => {
    if (!pendingRename) return;
    const nextName = renameValue.trim();
    if (!nextName) return;
    updatePlant(pendingRename.id, prev => ({
      ...prev,
      name: nextName,
    }));
    setPendingRename(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setPendingRename(null);
    setRenameValue('');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {archivedPlants.length === 0 ? (
          <ThemedView style={styles.emptyCard}>
            <ThemedText style={styles.emptyText}>
              No archived plants yet. Plants you archive from the Home tab will show up here.
            </ThemedText>
          </ThemedView>
        ) : (
          archivedPlants.map(plant => {
            const stage = FEEDING_STAGE_LOOKUP[plant.stageId];
            const lastLog = plant.logs[0];
            const totalMl = lastLog ? lastLog.fertilizers.reduce((sum, dose) => sum + dose.ml, 0) : 0;

            return (
              <ThemedView key={plant.id} style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={styles.headerInfo}>
                    <ThemedText type="title">{plant.name}</ThemedText>
                    <ThemedText style={styles.meta}>
                      Archived {formatDate(plant.archivedAt)} · Stage {stage?.name ?? plant.stageId}
                    </ThemedText>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleRename(plant)}
                      accessibilityRole="button"
                      accessibilityLabel={`Rename ${plant.name}`}>
                      <ThemedText type="defaultSemiBold">Rename</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, styles.restoreButton]}
                      onPress={() => handleRestore(plant.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Restore ${plant.name}`}>
                      <ThemedText type="defaultSemiBold" style={styles.restoreLabel}>
                        Restore
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleDelete(plant.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${plant.name}`}>
                      <ThemedText type="defaultSemiBold" style={styles.deleteLabel}>
                        Delete
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
                {lastLog ? (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Last watering</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {formatDate(lastLog.createdAt)} · {lastLog.waterLiters} L · {lastLog.strength}% · {formatMl(totalMl)} nutrients
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.summaryValue}>No waterings logged yet.</ThemedText>
                )}
              </ThemedView>
            );
          })
        )}
      </ScrollView>
      <ConfirmationDialog
        visible={Boolean(pendingRename)}
        title="Rename plant"
        message={pendingRename ? `Give ${pendingRename.name} a new name.` : 'Rename this plant.'}
        confirmLabel="Save"
        confirmDisabled={!renameValue.trim()}
        onCancel={handleCancelRename}
        onConfirm={handleConfirmRename}>
        <TextInput
          style={styles.renameInput}
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="New plant name"
          placeholderTextColor="rgba(148, 163, 184, 0.7)"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleConfirmRename}
        />
      </ConfirmationDialog>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  emptyCard: {
    marginTop: 48,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  meta: {
    fontSize: 12,
    opacity: 0.75,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  restoreButton: {
    borderColor: 'rgba(52, 211, 153, 0.5)',
  },
  restoreLabel: {
    color: '#10b981',
  },
  deleteLabel: {
    color: '#f87171',
  },
  renameInput: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#e2e8f0',
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
});
