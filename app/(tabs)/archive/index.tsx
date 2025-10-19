import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  const [activeMenu, setActiveMenu] = useState<PlantState | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const handleRestore = (id: string) => {
    archivePlant(id, false);
    setActiveMenu(null);
  };

  const handleRename = (plant: PlantState) => {
    setPendingRename(plant);
    setRenameValue(plant.name);
    setActiveMenu(null);
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
          onPress: () => {
            deletePlant(id);
          },
        },
      ]
    );
    setActiveMenu(null);
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
                  <Pressable
                    key={plant.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/archive/[id]',
                        params: { id: plant.id },
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`View ${plant.name} details`}
                    style={({ pressed }) => [pressed && styles.cardPressed]}
                    hitSlop={4}>
                    <ThemedView
                      style={[
                        styles.card,
                        {
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                        },
                      ]}>
                      <View style={styles.headerRow}>
                        <View style={styles.headerInfo}>
                          <ThemedText type="title">{plant.name}</ThemedText>
                          <ThemedText style={[styles.meta, { color: palette.muted }]}>
                            Archived {formatDate(plant.archivedAt)} · Stage {stage?.name ?? plant.stageId}
                          </ThemedText>
                        </View>
                        <Pressable
                          style={[styles.menuButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
                          onPress={event => {
                            event.stopPropagation();
                            setActiveMenu(plant);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Open actions for ${plant.name}`}>
                          <ThemedText type="title" style={{ color: palette.accent, marginTop: -4 }}>
                            ⋯
                          </ThemedText>
                        </Pressable>
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
                  </Pressable>
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
          <ConfirmationDialog
            visible={Boolean(activeMenu)}
            title={activeMenu ? `${activeMenu.name} options` : 'Plant options'}
            confirmLabel="Close"
            onCancel={() => setActiveMenu(null)}
            onConfirm={() => setActiveMenu(null)}>
            <View style={styles.menuList}>
              {activeMenu ? (
                <>
                  <Pressable
                    style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
                    onPress={() => handleRename(activeMenu)}
                    accessibilityRole="button"
                    accessibilityLabel={`Rename ${activeMenu.name}`}>
                    <ThemedText type="defaultSemiBold" style={styles.menuItemLabel}>
                      Rename plant
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
                    onPress={() => handleRestore(activeMenu.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Restore ${activeMenu.name}`}>
                    <ThemedText type="defaultSemiBold" style={[styles.menuItemLabel, { color: palette.success }]}>
                      Restore plant
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
                    onPress={() => handleDelete(activeMenu.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${activeMenu.name}`}>
                    <ThemedText type="defaultSemiBold" style={[styles.menuItemLabel, { color: palette.danger }]}>
                      Delete plant
                    </ThemedText>
                  </Pressable>
                </>
              ) : null}
            </View>
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
  cardPressed: {
    opacity: 0.85,
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
  menuButton: {
    width: 40,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  menuItemLabel: {
    fontSize: 14,
  },
});
