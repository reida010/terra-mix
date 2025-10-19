import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { PlantSelector } from '@/components/plant-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HistoryOverview } from '@/components/watering-history/history-overview';
import { HistoryTabs, HistoryTabId } from '@/components/watering-history/history-tabs';
import { RenameDialog } from '@/components/watering-history/rename-dialog';
import { TabPlaceholder } from '@/components/watering-history/tab-placeholder';
import { PlantInfo } from '@/components/watering-history/plant-info';
import { WateringLogForm } from '@/components/watering-history/watering-log-form';
import { Colors } from '@/constants/theme';
import { usePlants } from '@/context/PlantContext';
import { FeedingStageId, PlantState, WateringLogEntry } from '@/types/plant';
import { DEFAULT_FORM_EC, DEFAULT_FORM_PH, useWateringForm } from '@/hooks/useWateringForm';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdditiveDoseSummary, calculateAdditiveDoses, calculateFertilizerDoses } from '@/utils/feeding';

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
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTabId>('history');

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
    setPendingArchive(plant);
  };

  const handleRenamePlant = () => {
    if (!plant) return;
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

  const handleToggleRootAdditive = useCallback(
    (next: boolean) => {
      if (!plant) return;
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
      }));
    },
    [plant, updatePlant]
  );

  const handleToggleFulvicAdditive = useCallback(
    (next: boolean) => {
      if (!plant) return;
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
      }));
    },
    [plant, updatePlant]
  );

  const handleAdjustBloomAdditive = useCallback(
    (intensity: number) => {
      if (!plant) return;
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
      }));
    },
    [plant, updatePlant]
  );

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
            <WateringLogForm
              draftPlant={draftPlant}
              isCompact={isCompact}
              colorScheme={colorScheme}
              palette={palette}
              editingLog={editingLog}
              formStage={formStage}
              formStrength={formStrength}
              formWater={formWater}
              formPh={formPh}
              formEc={formEc}
              liters={liters}
              doses={doses}
              additiveDoses={additiveDoses}
              totalMl={totalMl}
              isEditing={isEditing}
              onStageChange={handleStageChange}
              onStrengthChange={handleStrengthChange}
              onWaterChange={handleWaterChange}
              onPhChange={setFormPh}
              onEcChange={setFormEc}
              onToggleRoot={handleToggleRootAdditive}
              onToggleFulvic={handleToggleFulvicAdditive}
              onAdjustBloom={handleAdjustBloomAdditive}
              onSubmit={handleSubmitLog}
              onCancel={handleCancelLogging}
            />
          ) : (
            <ScrollView contentContainerStyle={[styles.historyScroll, isCompact && styles.historyScrollCompact]}>
              <HistoryTabs activeTab={activeHistoryTab} onSelect={setActiveHistoryTab} palette={palette} isCompact={isCompact} />
              {activeHistoryTab === 'history' ? (
                <HistoryOverview
                  plant={plant}
                  palette={palette}
                  isCompact={isCompact}
                  onStartLogging={handleStartLogging}
                  onEditLog={handleEditLog}
                  onDeleteLog={handleDeleteLog}
                />
              ) : activeHistoryTab === 'info' ? (
                <PlantInfo
                  plant={plant}
                  palette={palette}
                  isCompact={isCompact}
                  onRename={handleRenamePlant}
                  onArchive={handleArchivePlant}
                  onDelete={() => requestDeletePlant(plant)}
                />
              ) : (
                <TabPlaceholder palette={palette} isCharts />
              )}
            </ScrollView>
          )}
        </ThemedView>
      </SafeAreaView>
      <RenameDialog
        visible={Boolean(pendingRename)}
        palette={palette}
        colorScheme={colorScheme}
        pendingRename={pendingRename}
        renameValue={renameValue}
        onChange={setRenameValue}
        onCancel={handleCancelRename}
        onConfirm={handleConfirmRename}
      />

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
  emptyState: {
    marginTop: 48,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
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
});
