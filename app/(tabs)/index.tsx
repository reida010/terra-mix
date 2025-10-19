import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { AdditiveCard } from '@/components/additive-card';
import { FertilizerSummary } from '@/components/fertilizer-summary';
import { NumberInput } from '@/components/number-input';
import { PlantSelector } from '@/components/plant-selector';
import { StagePicker } from '@/components/stage-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WateringHistory } from '@/components/watering-history';
import { BLOOM_BOOSTER_RECOMMENDATIONS, FEEDING_STAGES } from '@/constants/feeding';
import { usePlants } from '@/context/PlantContext';
import { FeedingStageId, PlantState, WateringLogEntry } from '@/types/plant';
import { AdditiveDoseSummary, calculateAdditiveDoses, calculateFertilizerDoses, formatMl } from '@/utils/feeding';

const DEFAULT_PH = 6;
const DEFAULT_EC = 1.2;

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
  const activePlants = useMemo(() => plants.filter(plant => !plant.archivedAt), [plants]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isLogging, setIsLogging] = useState(false);
  const [editingLog, setEditingLog] = useState<WateringLogEntry | null>(null);
  const [formStage, setFormStage] = useState<FeedingStageId>(FEEDING_STAGES[0].id);
  const [formStrength, setFormStrength] = useState<number>(75);
  const [formWater, setFormWater] = useState<number>(3);
  const [formPh, setFormPh] = useState<number>(DEFAULT_PH);
  const [formEc, setFormEc] = useState<number>(DEFAULT_EC);
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

  useEffect(() => {
    if (!plant) return;
    const lastLog = plant.logs[0];
    const fallbackPh = typeof lastLog?.ph === 'number' ? lastLog.ph : DEFAULT_PH;
    const fallbackEc = typeof lastLog?.ec === 'number' ? lastLog.ec : DEFAULT_EC;

    if (!isLogging) {
      setFormStage(plant.stageId);
      setFormStrength(plant.strength);
      setFormWater(plant.preferredWaterLiters);
      setFormPh(fallbackPh);
      setFormEc(fallbackEc);
      setEditingLog(null);
      return;
    }

    if (editingLog) {
      setFormStage(editingLog.stageId);
      setFormStrength(editingLog.strength);
      setFormWater(editingLog.waterLiters);
      setFormPh(typeof editingLog.ph === 'number' ? editingLog.ph : fallbackPh);
      setFormEc(typeof editingLog.ec === 'number' ? editingLog.ec : fallbackEc);
    } else {
      setFormStage(plant.stageId);
      setFormStrength(plant.strength);
      setFormWater(plant.preferredWaterLiters);
      setFormPh(fallbackPh);
      setFormEc(fallbackEc);
    }
  }, [plant, isLogging, editingLog]);

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

  const handleStageChange = (stageId: FeedingStageId) => {
    setFormStage(stageId);
    if (plant && !editingLog) {
      updatePlant(plant.id, prev => ({
        ...prev,
        stageId,
      }));
    }
  };

  const handleStrengthChange = (value: number) => {
    setFormStrength(value);
    if (plant && !editingLog) {
      updatePlant(plant.id, prev => ({
        ...prev,
        strength: Math.round(value),
      }));
    }
  };

  const handleWaterChange = (value: number) => {
    setFormWater(value);
    if (plant && !editingLog) {
      updatePlant(plant.id, prev => ({
        ...prev,
        preferredWaterLiters: Math.max(0, value),
      }));
    }
  };

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
    const safePh = Number.isFinite(formPh) ? formPh : DEFAULT_PH;
    const safeEc = Number.isFinite(formEc) ? formEc : DEFAULT_EC;
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

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!plant) {
    return (
      <>
        <ThemedView style={styles.container}>
          <PlantSelector
            plants={activePlants}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddPlant={() => addPlant()}
          />
          <View style={styles.emptyState}>
            <ThemedText>No active plants yet. Add one or restore from the Archive tab.</ThemedText>
          </View>
        </ThemedView>
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
  }

  const totalMl = doses.reduce((sum, dose) => sum + dose.ml, 0);
  const isEditing = Boolean(editingLog);

  return (
    <>
      <ThemedView style={styles.container}>
        <PlantSelector
          plants={activePlants}
          selectedId={plant.id}
          onSelect={setSelectedId}
          onAddPlant={() => addPlant()}
        />
      {isLogging ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {isEditing && editingLog ? (
            <ThemedText style={styles.editingBanner}>
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
            <ThemedText style={styles.helperCopy}>
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

          <ThemedView style={styles.tipCard}>
            <ThemedText type="subtitle">Bloom game plan</ThemedText>
            <ThemedText style={styles.tipCopy}>
              Suggested bloom stimulant intensity for {formStage} is {BLOOM_BOOSTER_RECOMMENDATIONS[formStage]}%. Keep an eye on leaf tips—dial back 5% if you see light burn, or add 5%
              when plants are hungry.
            </ThemedText>
          </ThemedView>

          <Pressable style={styles.logButton} onPress={handleSubmitLog} accessibilityRole="button">
            <ThemedText type="title" style={styles.logButtonLabel}>
              {isEditing ? 'Save changes' : 'Log watering'} ({liters} L · {formStrength}% · {formatMl(totalMl)} nutrients)
            </ThemedText>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.historyScroll}>
          <View style={styles.historyHeader}>
            <ThemedText type="title">Watering history</ThemedText>
            <View style={styles.historyActions}>
              <Pressable style={styles.addLogButton} onPress={handleStartLogging} accessibilityRole="button">
                <ThemedText type="defaultSemiBold" style={styles.addLogLabel}>
                  + Log watering
                </ThemedText>
              </Pressable>
              <Pressable
                style={styles.menuButton}
                onPress={openHistoryMenu}
                accessibilityRole="button"
                accessibilityLabel={`Open actions for ${plant.name}`}>
                <ThemedText type="title" style={styles.menuLabel}>
                  ⋯
                </ThemedText>
              </Pressable>
            </View>
          </View>
          <WateringHistory logs={plant.logs} onEdit={handleEditLog} onDelete={handleDeleteLog} />
        </ScrollView>
      )}
      </ThemedView>
      <ConfirmationDialog
        visible={historyMenuOpen}
        title={`${plant.name} options`}
        confirmLabel="Close"
        onCancel={closeHistoryMenu}
        onConfirm={closeHistoryMenu}>
        <View style={styles.menuList}>
          <Pressable
            style={styles.menuItem}
            onPress={handleRenamePlant}
            accessibilityRole="button"
            accessibilityLabel={`Rename ${plant.name}`}>
            <ThemedText type="defaultSemiBold" style={styles.menuItemLabel}>
              Rename plant
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={handleArchivePlant}
            accessibilityRole="button"
            accessibilityLabel={`Archive ${plant.name}`}>
            <ThemedText type="defaultSemiBold" style={styles.menuItemLabel}>
              Archive plant
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => requestDeletePlant(plant)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${plant.name}`}>
            <ThemedText type="defaultSemiBold" style={[styles.menuItemLabel, styles.menuItemDestructive]}>
              Delete plant
            </ThemedText>
          </Pressable>
        </View>
      </ConfirmationDialog>
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
    </>
  );
}

const styles = StyleSheet.create({
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
  historyScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 12,
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
  },
  tipCopy: {
    opacity: 0.85,
    fontSize: 13,
  },
  logButton: {
    marginTop: 24,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  logButtonLabel: {
    textAlign: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addLogButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  addLogLabel: {
    fontSize: 14,
  },
  menuButton: {
    width: 42,
    height: 38,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    marginTop: -4,
  },
  emptyState: {
    marginTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  editingBanner: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    fontSize: 13,
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
  menuList: {
    gap: 8,
  },
  menuItem: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  menuItemLabel: {
    fontSize: 14,
  },
  menuItemDestructive: {
    color: '#f87171',
  },
});
