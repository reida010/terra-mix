import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { AdditiveCard } from '@/components/additive-card';
import { FertilizerSummary } from '@/components/fertilizer-summary';
import { NumberInput } from '@/components/number-input';
import { PlantSelector } from '@/components/plant-selector';
import { StagePicker } from '@/components/stage-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WateringHistory } from '@/components/watering-history';
import { BLOOM_BOOSTER_RECOMMENDATIONS } from '@/constants/feeding';
import { Colors } from '@/constants/theme';
import { usePlants } from '@/context/PlantContext';
import { FeedingStageId, PlantState, WateringLogEntry } from '@/types/plant';
import { DEFAULT_FORM_EC, DEFAULT_FORM_PH, useWateringForm } from '@/hooks/useWateringForm';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdditiveDoseSummary, calculateAdditiveDoses, calculateFertilizerDoses, formatMl } from '@/utils/feeding';

export default function HomeScreen() {
  const {
    plants,
    loading,
    addPlant,
    updatePlant,
    deletePlant,
    logWatering,
    archivePlant,
    updateWateringLog,
    deleteWateringLog,
  } = usePlants();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const activePlants = useMemo(() => plants.filter(plant => !plant.archivedAt), [plants]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isLogging, setIsLogging] = useState(false);
  const [editingLog, setEditingLog] = useState<WateringLogEntry | null>(null);
  const [pendingArchive, setPendingArchive] = useState<PlantState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PlantState | null>(null);
  const [pendingLogDelete, setPendingLogDelete] = useState<{
    plantId: string;
    log: WateringLogEntry;
  } | null>(null);
  const [pendingRename, setPendingRename] = useState<PlantState | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);

  useEffect(() => {
    if (!selectedId && activePlants.length > 0) {
      setSelectedId(activePlants[0].id);
    }
  }, [selectedId, activePlants]);

  useEffect(() => {
    if (selectedId && !activePlants.find(plant => plant.id === selectedId)) {
      setSelectedId(activePlants[0]?.id);
    }
  }, [selectedId, activePlants]);

  useEffect(() => {
    setIsLogging(false);
    setEditingLog(null);
  }, [selectedId]);

  const plant = useMemo(() => activePlants.find(p => p.id === selectedId), [activePlants, selectedId]);
  const persistStage = useCallback(
    (stageId: FeedingStageId) => {
      if (!plant) return;
      updatePlant(plant.id, prev => ({
        ...prev,
        stageId,
      }));
    },
    [plant, updatePlant]
  );

  const persistStrength = useCallback(
    (strength: number) => {
      if (!plant) return;
      updatePlant(plant.id, prev => ({
        ...prev,
        strength,
      }));
    },
    [plant, updatePlant]
  );

  const persistWater = useCallback(
    (liters: number) => {
      if (!plant) return;
      updatePlant(plant.id, prev => ({
        ...prev,
        preferredWaterLiters: liters,
      }));
    },
    [plant, updatePlant]
  );

  const {
    stageId: formStage,
    strength: formStrength,
    waterLiters: formWater,
    ph: formPh,
    ec: formEc,
    setStageId: handleStageChange,
    setStrength: handleStrengthChange,
    setWaterLiters: handleWaterChange,
    setPh: setFormPh,
    setEc: setFormEc,
  } = useWateringForm({
    plant,
    editingLog,
    isLogging,
    onStagePersist: persistStage,
    onStrengthPersist: persistStrength,
    onWaterPersist: persistWater,
  });

  useEffect(() => {
    if (!plant) {
      setHistoryMenuOpen(false);
    }
  }, [plant]);

  const liters = formWater > 0 ? formWater : 1;

  const draftPlant = useMemo(() => {
    if (!plant) return undefined;
    return {
      ...plant,
      stageId: formStage,
      strength: formStrength,
      preferredWaterLiters: formWater,
    };
  }, [plant, formStage, formStrength, formWater]);

  const doses = useMemo(() => {
    if (!draftPlant) return [];
    const safeLiters = liters > 0 ? liters : 1;
    return calculateFertilizerDoses(draftPlant, safeLiters);
  }, [draftPlant, liters]);

  const additiveDoses = useMemo<AdditiveDoseSummary>(() => {
    if (!draftPlant) return {} as AdditiveDoseSummary;
    const safeLiters = liters > 0 ? liters : 1;
    return calculateAdditiveDoses(draftPlant, safeLiters);
  }, [draftPlant, liters]);

  const handleArchivePlant = () => {
    if (!plant) return;
    setHistoryMenuOpen(false);
    setPendingArchive(plant);
  };

  const handleRenamePlant = () => {
    if (!plant) return;
    setHistoryMenuOpen(false);
    setPendingRename(plant);
    setRenameValue(plant.name);
  };

  const handleConfirmArchive = () => {
    if (!pendingArchive) return;
    archivePlant(pendingArchive.id, true);
    if (pendingArchive.id === selectedId) {
      setSelectedId(undefined);
    }
    setIsLogging(false);
    setEditingLog(null);
    setPendingArchive(null);
  };

  const handleCancelArchive = () => {
    setPendingArchive(null);
  };

  const requestDeletePlant = (plantState: PlantState) => {
    setHistoryMenuOpen(false);
    setPendingDelete(plantState);
  };

  const openHistoryMenu = () => setHistoryMenuOpen(true);
  const closeHistoryMenu = () => setHistoryMenuOpen(false);

  const handleConfirmDeletePlant = () => {
    if (!pendingDelete) return;
    deletePlant(pendingDelete.id);
    if (pendingDelete.id === selectedId) {
      setSelectedId(undefined);
      setIsLogging(false);
      setEditingLog(null);
    }
    setPendingDelete(null);
  };

  const handleCancelDeletePlant = () => {
    setPendingDelete(null);
  };

  const handleStartLogging = () => {
    setEditingLog(null);
    setIsLogging(true);
  };

  const handleCancelLogging = () => {
    setEditingLog(null);
    setIsLogging(false);
  };

  const handleEditLog = (log: WateringLogEntry) => {
    setEditingLog(log);
    setIsLogging(true);
  };

  const handleDeleteLog = (log: WateringLogEntry) => {
    if (!plant) return;
    setPendingLogDelete({ plantId: plant.id, log });
  };

  const handleConfirmDeleteLog = () => {
    if (!pendingLogDelete) return;
    deleteWateringLog(pendingLogDelete.plantId, pendingLogDelete.log.id);
    if (editingLog && editingLog.id === pendingLogDelete.log.id) {
      setEditingLog(null);
      setIsLogging(false);
    }
    setPendingLogDelete(null);
  };

  const handleCancelDeleteLog = () => {
    setPendingLogDelete(null);
  };

  const handleCancelRename = () => {
    setPendingRename(null);
    setRenameValue('');
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

  const handleSubmitLog = () => {
    if (!plant || !draftPlant) return;
    const safeLiters = liters > 0 ? liters : 1;
    const safePh = Number.isFinite(formPh) ? formPh : DEFAULT_FORM_PH;
    const safeEc = Number.isFinite(formEc) ? formEc : DEFAULT_FORM_EC;
    const normalizedPh = Number(safePh.toFixed(2));
    const normalizedEc = Number(safeEc.toFixed(2));

    if (editingLog) {
      updateWateringLog(plant.id, editingLog.id, entry => ({
        ...entry,
        waterLiters: safeLiters,
        strength: formStrength,
        stageId: formStage,
        ph: normalizedPh,
        ec: normalizedEc,
        fertilizers: doses,
        additives: additiveDoses,
      }));
    } else {
      const logEntry: WateringLogEntry = {
        id: `log-${Date.now()}`,
        createdAt: new Date().toISOString(),
        waterLiters: safeLiters,
        strength: formStrength,
        stageId: formStage,
        ph: normalizedPh,
        ec: normalizedEc,
        fertilizers: doses,
        additives: additiveDoses,
      };
      logWatering(plant.id, logEntry);
    }

    setIsLogging(false);
    setEditingLog(null);
  };

  const confirmationDialogs = (
    <>
      <ConfirmationDialog
        visible={Boolean(pendingArchive)}
        title="Archive plant"
        message={
          pendingArchive
            ? `Archive ${pendingArchive.name}? You can restore it from the Archive tab.`
            : 'Archive this plant? You can restore it later.'
        }
        confirmLabel="Archive"
        onCancel={handleCancelArchive}
        onConfirm={handleConfirmArchive}
      />
      <ConfirmationDialog
        visible={Boolean(pendingDelete)}
        title="Delete plant"
        message={
          pendingDelete
            ? `Permanently delete ${pendingDelete.name}? This cannot be undone.`
            : 'Permanently delete this plant? This cannot be undone.'
        }
        confirmLabel="Delete"
        confirmTone="destructive"
        onCancel={handleCancelDeletePlant}
        onConfirm={handleConfirmDeletePlant}
      />
      <ConfirmationDialog
        visible={Boolean(pendingLogDelete)}
        title="Delete watering"
        message={
          pendingLogDelete
            ? `Remove the watering logged on ${new Date(
                pendingLogDelete.log.createdAt
              ).toLocaleDateString()}? This cannot be undone.`
            : 'Remove this watering entry? This cannot be undone.'
        }
        confirmLabel="Delete"
        confirmTone="destructive"
        onCancel={handleCancelDeleteLog}
        onConfirm={handleConfirmDeleteLog}
      />
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator color={palette.accent} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!plant) {
    return (
      <>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
          <ThemedView style={styles.container}>
            <PlantSelector
              plants={activePlants}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAddPlant={() => addPlant()}
            />
            <ThemedView
              style={[styles.emptyState, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted }}>
                No active plants yet. Add one or restore from the Archive tab.
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
        {confirmationDialogs}
      </>
    );
  }

  const totalMl = doses.reduce((sum, dose) => sum + dose.ml, 0);
  const isEditing = Boolean(editingLog);

  return (
    <>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
        <ThemedView style={styles.container}>
          <PlantSelector
            plants={activePlants}
            selectedId={plant.id}
            onSelect={setSelectedId}
            onAddPlant={() => addPlant()}
          />
          {isLogging ? (
        <ScrollView contentContainerStyle={[styles.scroll, isCompact && styles.scrollCompact]}>
          {isEditing && editingLog ? (
            <ThemedText style={[styles.editingBanner, { backgroundColor: palette.accentSoft, color: palette.accent }]}>
              Editing log from {new Date(editingLog.createdAt).toLocaleDateString()} at{' '}
              {new Date(editingLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          ) : null}
          <View style={styles.section}>
            <StagePicker value={formStage} onChange={handleStageChange} />
            <NumberInput
              label="Strength"
              unit="%"
              value={formStrength}
              minimum={40}
              maximum={110}
              step={5}
              onChange={handleStrengthChange}
            />
            <NumberInput
              label="Water volume"
              unit="L"
              value={formWater}
              minimum={0.5}
              step={0.5}
              onChange={handleWaterChange}
            />
            <ThemedText style={[styles.helperCopy, { color: palette.muted }]}>
              The strength slider multiplies the base feeding chart. 100% equals the published Terra Aquatica schedule.
            </ThemedText>
          </View>

          <FertilizerSummary doses={doses} waterLiters={liters} />

          {draftPlant ? (
            <AdditiveCard
              plant={draftPlant}
              doses={additiveDoses}
              waterLiters={liters}
              onToggleRoot={next =>
                updatePlant(plant.id, prev => ({
                  ...prev,
                  additives: {
                    ...prev.additives,
                    rootStimulant: {
                      ...prev.additives.rootStimulant,
                      active: next,
                      startDate: next ? new Date().toISOString() : undefined,
                    },
                  },
                }))
              }
              onToggleFulvic={next =>
                updatePlant(plant.id, prev => ({
                  ...prev,
                  additives: {
                    ...prev.additives,
                    fulvicAcid: {
                      ...prev.additives.fulvicAcid,
                      active: next,
                      startedAt: next ? new Date().toISOString() : undefined,
                    },
                  },
                }))
              }
              onAdjustBloom={intensity =>
                updatePlant(plant.id, prev => ({
                  ...prev,
                  additives: {
                    ...prev.additives,
                    bloomBooster: {
                      ...prev.additives.bloomBooster,
                      active: intensity > 0,
                      intensity,
                      lastAdjustedAt: new Date().toISOString(),
                    },
                  },
                }))
              }
            />
          ) : null}

          <ThemedView
            style={[styles.tipCard, { backgroundColor: palette.primarySoft, borderColor: palette.primary }]}
            lightColor={palette.primarySoft}
            darkColor={palette.primarySoft}>
            <ThemedText type="subtitle">Bloom game plan</ThemedText>
            <ThemedText style={[styles.tipCopy, { color: palette.primary }]}>
              Suggested bloom stimulant intensity for {formStage} is {BLOOM_BOOSTER_RECOMMENDATIONS[formStage]}%. Keep an eye on leaf tips—dial back 5% if you see light burn, or add 5%
              when plants are hungry.
            </ThemedText>
          </ThemedView>

          <View style={[styles.section, styles.measureSection]}>
            <NumberInput
              label="pH"
              value={formPh}
              minimum={0}
              maximum={14}
              step={0.1}
              onChange={setFormPh}
            />
            <NumberInput
              label="EC"
              unit="mS/cm"
              value={formEc}
              minimum={0}
              step={0.1}
              onChange={setFormEc}
            />
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
            onPress={handleSubmitLog}
            accessibilityRole="button">
            <ThemedText
              type={isCompact ? 'defaultSemiBold' : 'title'}
              lightColor="#FFFFFF"
              darkColor={Colors.dark.background}
              style={[styles.logButtonLabel, isCompact && styles.logButtonLabelCompact]}>
              {isEditing ? 'Save changes' : 'Log watering'} ({liters} L · {formStrength}% · {formatMl(totalMl)} nutrients)
            </ThemedText>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.historyScroll, isCompact && styles.historyScrollCompact]}>
          <View style={[styles.historyHeader, isCompact && styles.historyHeaderCompact]}>
            <ThemedText type={isCompact ? 'defaultSemiBold' : 'title'} style={isCompact && styles.historyTitleCompact}>
              Watering history
            </ThemedText>
            <View style={[styles.historyActions, isCompact && styles.historyActionsCompact]}>
              <Pressable
                style={[
                  styles.addLogButton,
                  { borderColor: palette.accent, backgroundColor: palette.accentSoft },
                  isCompact && styles.addLogButtonCompact,
                ]}
                onPress={handleStartLogging}
                accessibilityRole="button">
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.addLogLabel, { color: palette.accent }, isCompact && styles.addLogLabelCompact]}>
                  + Log watering
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.menuButton, { borderColor: palette.border, backgroundColor: palette.surface }, isCompact && styles.menuButtonCompact]}
                onPress={openHistoryMenu}
                accessibilityRole="button"
                accessibilityLabel={`Open actions for ${plant.name}`}>
                <ThemedText
                  type={isCompact ? 'defaultSemiBold' : 'title'}
                  style={[styles.menuLabel, { color: palette.accent }, isCompact && styles.menuLabelCompact]}>
                  ⋯
                </ThemedText>
              </Pressable>
            </View>
          </View>
          <WateringHistory logs={plant.logs} onEdit={handleEditLog} onDelete={handleDeleteLog} />
        </ScrollView>
      )}
        </ThemedView>
      </SafeAreaView>
      <ConfirmationDialog
        visible={historyMenuOpen}
        title={`${plant.name} options`}
        confirmLabel="Close"
        onCancel={closeHistoryMenu}
        onConfirm={closeHistoryMenu}>
        <View style={styles.menuList}>
          <Pressable
            style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={handleRenamePlant}
            accessibilityRole="button"
            accessibilityLabel={`Rename ${plant.name}`}>
            <ThemedText type="defaultSemiBold" style={styles.menuItemLabel}>
              Rename plant
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={handleArchivePlant}
            accessibilityRole="button"
            accessibilityLabel={`Archive ${plant.name}`}>
            <ThemedText type="defaultSemiBold" style={styles.menuItemLabel}>
              Archive plant
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.menuItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={() => requestDeletePlant(plant)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${plant.name}`}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.menuItemLabel, { color: palette.danger }]}>
              Delete plant
            </ThemedText>
          </Pressable>
        </View>
      </ConfirmationDialog>
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

      {confirmationDialogs}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  scrollCompact: {
    paddingBottom: 80,
  },
  historyScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 12,
  },
  historyScrollCompact: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 12,
    gap: 8,
  },
  measureSection: {
    marginTop: 24,
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
  logActions: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
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
  logButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
  },
  logButtonCompact: {
    paddingVertical: 12,
    borderRadius: 16,
    width: '100%',
  },
  logButtonLabel: {
    textAlign: 'center',
  },
  logButtonLabelCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  historyTitleCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  historyActionsCompact: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addLogButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  addLogButtonCompact: {
    flex: 1,
  },
  addLogLabel: {
    fontSize: 14,
  },
  addLogLabelCompact: {
    textAlign: 'center',
  },
  menuButton: {
    width: 42,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonCompact: {
    width: 36,
    height: 36,
  },
  menuLabel: {
    marginTop: -4,
  },
  menuLabelCompact: {
    marginTop: 0,
  },
  emptyState: {
    marginTop: 48,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  editingBanner: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    fontSize: 13,
  },
  renameInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
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
