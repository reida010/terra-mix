import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

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
    <>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
        <ThemedView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
        {archivedPlants.length === 0 ? (
          <ThemedView style={[styles.emptyCard, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
            <ThemedText style={[styles.emptyText, { color: palette.muted }]}> 
              No archived plants yet. Plants you archive from the Home tab will show up here.
            </ThemedText>
          </ThemedView>
        ) : (
          archivedPlants.map(plant => {
            const stage = FEEDING_STAGE_LOOKUP[plant.stageId];
            const lastLog = plant.logs[0];
            const totalMl = lastLog ? lastLog.fertilizers.reduce((sum, dose) => sum + dose.ml, 0) : 0;

            return (
              <ThemedView
                key={plant.id}
                style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <View style={styles.headerRow}>
                  <View style={styles.headerInfo}>
                    <ThemedText type="title">{plant.name}</ThemedText>
                    <ThemedText style={[styles.meta, { color: palette.muted }]}>
                      Archived {formatDate(plant.archivedAt)} · Stage {stage?.name ?? plant.stageId}
                    </ThemedText>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.actionButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
                      onPress={() => handleRename(plant)}
                      accessibilityRole="button"
                      accessibilityLabel={`Rename ${plant.name}`}>
                      <ThemedText type="defaultSemiBold" style={{ color: palette.accent }}>
                        Rename
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, { borderColor: palette.success, backgroundColor: palette.primarySoft }]}
                      onPress={() => handleRestore(plant.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Restore ${plant.name}`}>
                      <ThemedText type="defaultSemiBold" style={{ color: palette.success }}>
                        Restore
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, { borderColor: palette.danger, backgroundColor: colorScheme === 'light' ? 'rgba(199, 86, 96, 0.12)' : 'rgba(240, 149, 154, 0.18)' }]}
                      onPress={() => handleDelete(plant.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${plant.name}`}>
                      <ThemedText type="defaultSemiBold" style={{ color: palette.danger }}>
                        Delete
                      </ThemedText>
                    </Pressable>
                  </View>
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
          style={[styles.renameInput, { borderColor: palette.border, backgroundColor: palette.surface, color: palette.text }]}
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="New plant name"
          placeholderTextColor={colorScheme === 'light' ? 'rgba(15, 52, 69, 0.35)' : 'rgba(228, 243, 250, 0.45)'}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleConfirmRename}
        />
          </ConfirmationDialog>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    borderWidth: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
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
    borderWidth: 1,
  },
  renameInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
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
