import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
  const [pendingArchive, setPendingArchive] = useState<PlantState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PlantState | null>(null);
  const [pendingLogDelete, setPendingLogDelete] = useState<{
    plantId: string;
    log: WateringLogEntry;
  } | null>(null);

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
    if (!isLogging) {
      setFormStage(plant.stageId);
      setFormStrength(plant.strength);
      setFormWater(plant.preferredWaterLiters);
      setEditingLog(null);
      return;
    }

    if (editingLog) {
      setFormStage(editingLog.stageId);
      setFormStrength(editingLog.strength);
      setFormWater(editingLog.waterLiters);
    } else {
      setFormStage(plant.stageId);
      setFormStrength(plant.strength);
      setFormWater(plant.preferredWaterLiters);
    }
  }, [plant, isLogging, editingLog]);

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
    setPendingArchive(plant);
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
    setPendingDelete(plantState);
  };

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

  const handleSubmitLog = () => {
    if (!plant || !draftPlant) return;
    const safeLiters = liters > 0 ? liters : 1;

    if (editingLog) {
      updateWateringLog(plant.id, editingLog.id, entry => ({
        ...entry,
        waterLiters: safeLiters,
        strength: formStrength,
        stageId: formStage,
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
              <Pressable
                style={styles.archiveButton}
                onPress={handleArchivePlant}
                accessibilityRole="button"
                accessibilityLabel={`Archive ${plant.name}`}>
                <ThemedText type="defaultSemiBold" style={styles.archiveLabel}>
                  Archive
                </ThemedText>
              </Pressable>
              <Pressable
                style={styles.deletePlantButton}
                onPress={() => requestDeletePlant(plant)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${plant.name}`}>
                <ThemedText type="defaultSemiBold" style={styles.deletePlantLabel}>
                  × Delete
                </ThemedText>
              </Pressable>
              <Pressable style={styles.addLogButton} onPress={handleStartLogging} accessibilityRole="button">
                <ThemedText type="defaultSemiBold" style={styles.addLogLabel}>
                  + Log watering
                </ThemedText>
              </Pressable>
            </View>
          </View>
          <WateringHistory logs={plant.logs} onEdit={handleEditLog} onDelete={handleDeleteLog} />
        </ScrollView>
      )}
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
  deletePlantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  deletePlantLabel: {
    fontSize: 14,
    color: '#f87171',
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
  archiveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  archiveLabel: {
    fontSize: 14,
    color: '#f87171',
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
});
