import { useCallback, useEffect, useRef, useState } from 'react';

import { FEEDING_STAGES } from '@/constants/feeding';
import { FeedingStageId, PlantState, WateringLogEntry } from '@/types/plant';

export const DEFAULT_FORM_PH = 6;
export const DEFAULT_FORM_EC = 1.2;

type PersistCallbacks = {
  onStagePersist?: (stage: FeedingStageId) => void;
  onStrengthPersist?: (strength: number) => void;
  onWaterPersist?: (liters: number) => void;
};

interface UseWateringFormOptions extends PersistCallbacks {
  plant?: PlantState;
  editingLog: WateringLogEntry | null;
  isLogging: boolean;
}

interface UseWateringFormResult {
  stageId: FeedingStageId;
  strength: number;
  waterLiters: number;
  ph: number;
  ec: number;
  setStageId: (stage: FeedingStageId) => void;
  setStrength: (strength: number) => void;
  setWaterLiters: (liters: number) => void;
  setPh: (value: number) => void;
  setEc: (value: number) => void;
}

const DEFAULT_STAGE = FEEDING_STAGES[0].id;

const getLatestReading = (value?: number, fallback?: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return fallback ?? 0;
};

export function useWateringForm({
  plant,
  editingLog,
  isLogging,
  onStagePersist,
  onStrengthPersist,
  onWaterPersist,
}: UseWateringFormOptions): UseWateringFormResult {
  const [stageId, setStageIdState] = useState<FeedingStageId>(plant?.stageId ?? DEFAULT_STAGE);
  const [strength, setStrengthState] = useState<number>(plant?.strength ?? 75);
  const [waterLiters, setWaterLitersState] = useState<number>(plant?.preferredWaterLiters ?? 3);
  const [ph, setPhState] = useState<number>(DEFAULT_FORM_PH);
  const [ec, setEcState] = useState<number>(DEFAULT_FORM_EC);

  const previousPlantId = useRef<string | null>(null);
  const previousPlantStage = useRef<FeedingStageId | null>(null);
  const previousEditingLogId = useRef<string | null>(null);
  const previousIsLogging = useRef<boolean>(isLogging);
  const strengthRef = useRef<number>(strength);
  const waterRef = useRef<number>(waterLiters);

  useEffect(() => {
    strengthRef.current = strength;
  }, [strength]);

  useEffect(() => {
    waterRef.current = waterLiters;
  }, [waterLiters]);

  useEffect(() => {
    if (!plant) {
      setStageIdState(DEFAULT_STAGE);
      setStrengthState(75);
      setWaterLitersState(3);
      setPhState(DEFAULT_FORM_PH);
      setEcState(DEFAULT_FORM_EC);
      previousPlantId.current = null;
      previousPlantStage.current = null;
      previousEditingLogId.current = null;
      previousIsLogging.current = isLogging;
      return;
    }

    const lastLog = plant.logs[0];
    const fallbackPh = getLatestReading(lastLog?.ph, DEFAULT_FORM_PH);
    const fallbackEc = getLatestReading(lastLog?.ec, DEFAULT_FORM_EC);

    const firstRun = previousPlantId.current === null;
    const plantChanged = firstRun || plant.id !== previousPlantId.current;
    const plantStageChanged = firstRun || plant.stageId !== previousPlantStage.current;
    const editingLogChanged = firstRun || (editingLog?.id ?? null) !== previousEditingLogId.current;
    const loggingToggled = previousIsLogging.current !== isLogging;

    if (!isLogging) {
      if (plantChanged || plantStageChanged || loggingToggled) {
        setStageIdState(plant.stageId);
      }
      if (plantChanged || loggingToggled || strengthRef.current !== plant.strength) {
        setStrengthState(plant.strength);
      }
      if (plantChanged || loggingToggled || waterRef.current !== plant.preferredWaterLiters) {
        setWaterLitersState(plant.preferredWaterLiters);
      }
      if (plantChanged || loggingToggled) {
        setPhState(fallbackPh);
        setEcState(fallbackEc);
      }
    } else if (editingLog) {
      if (plantChanged || editingLogChanged) {
        setStageIdState(editingLog.stageId);
        setStrengthState(editingLog.strength);
        setWaterLitersState(editingLog.waterLiters);
        setPhState(getLatestReading(editingLog.ph, fallbackPh));
        setEcState(getLatestReading(editingLog.ec, fallbackEc));
      }
    } else {
      if (plantChanged || plantStageChanged || loggingToggled || editingLogChanged) {
        setStageIdState(plant.stageId);
      }
      if (plantChanged || loggingToggled || editingLogChanged) {
        setStrengthState(plant.strength);
        setWaterLitersState(plant.preferredWaterLiters);
        setPhState(fallbackPh);
        setEcState(fallbackEc);
      }
    }

    previousPlantId.current = plant.id;
    previousPlantStage.current = plant.stageId;
    previousEditingLogId.current = editingLog?.id ?? null;
    previousIsLogging.current = isLogging;
  }, [plant, editingLog, isLogging]);

  const handleStageChange = useCallback(
    (nextStage: FeedingStageId) => {
      setStageIdState(nextStage);
      if (plant && !isLogging && !editingLog) {
        onStagePersist?.(nextStage);
      }
    },
    [plant, isLogging, editingLog, onStagePersist]
  );

  const handleStrengthChange = useCallback(
    (nextStrength: number) => {
      const normalized = Math.round(nextStrength);
      setStrengthState(normalized);
      if (plant && !isLogging && !editingLog) {
        onStrengthPersist?.(normalized);
      }
    },
    [plant, isLogging, editingLog, onStrengthPersist]
  );

  const handleWaterChange = useCallback(
    (nextLiters: number) => {
      setWaterLitersState(nextLiters);
      if (plant && !isLogging && !editingLog) {
        const sanitized = Number.isFinite(nextLiters) ? Math.max(0, nextLiters) : 0;
        onWaterPersist?.(sanitized);
      }
    },
    [plant, isLogging, editingLog, onWaterPersist]
  );

  return {
    stageId,
    strength,
    waterLiters,
    ph,
    ec,
    setStageId: handleStageChange,
    setStrength: handleStrengthChange,
    setWaterLiters: handleWaterChange,
    setPh: setPhState,
    setEc: setEcState,
  };
}
