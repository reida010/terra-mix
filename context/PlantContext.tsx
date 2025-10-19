import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  BLOOM_BOOSTER_RECOMMENDATIONS,
  FEEDING_STAGE_LOOKUP,
  FEEDING_STAGES,
  FULVIC_ACID_DEFAULT_DOSAGE,
  INITIAL_PLANT_NAMES,
  ROOT_STIMULANT_DEFAULT_DOSAGE,
  ROOT_STIMULANT_DEFAULT_DURATION,
} from '@/constants/feeding';
import { AdditivesState, PlantState, WateringLogEntry } from '@/types/plant';
import { differenceInDays } from '@/utils/dates';
import { storageGet, storageSet } from '@/utils/storage';

const STORAGE_KEY = 'terra-mix::plants';

const createInitialAdditives = (): AdditivesState => ({
  rootStimulant: {
    active: false,
    durationDays: ROOT_STIMULANT_DEFAULT_DURATION,
    dosageMlPerLiter: ROOT_STIMULANT_DEFAULT_DOSAGE,
  },
  fulvicAcid: {
    active: false,
    dosageMlPerLiter: FULVIC_ACID_DEFAULT_DOSAGE,
  },
  bloomBooster: {
    active: false,
    intensity: 0,
  },
});

const normalizePlant = (plant: PlantState): PlantState => {
  const stage = FEEDING_STAGE_LOOKUP[plant.stageId];
  if (!stage) {
    return {
      ...plant,
      updatedAt: new Date().toISOString(),
    };
  }

  const rootState = plant.additives.rootStimulant;
  let nextRootActive = rootState.active;
  let nextRootStart = rootState.startDate;
  if (rootState.active && rootState.startDate) {
    const elapsed = differenceInDays(rootState.startDate);
    if (elapsed >= rootState.durationDays) {
      nextRootActive = false;
      nextRootStart = undefined;
    }
  }

  const bloomRecommendation = BLOOM_BOOSTER_RECOMMENDATIONS[plant.stageId];
  const hasManualBloomAdjustment = Boolean(plant.additives.bloomBooster.lastAdjustedAt);
  const nextBloomIntensity = hasManualBloomAdjustment
    ? plant.additives.bloomBooster.intensity
    : bloomRecommendation;
  const nextBloomActive = hasManualBloomAdjustment
    ? plant.additives.bloomBooster.intensity > 0
    : bloomRecommendation > 0;

  const shouldDisableFulvic = ['flower', 'lateFlower', 'ripen'].includes(plant.stageId);

  const additives: AdditivesState = {
    ...plant.additives,
    rootStimulant: {
      ...plant.additives.rootStimulant,
      active: nextRootActive,
      startDate: nextRootStart,
      durationDays: plant.additives.rootStimulant.durationDays || ROOT_STIMULANT_DEFAULT_DURATION,
      dosageMlPerLiter:
        plant.additives.rootStimulant.dosageMlPerLiter ?? ROOT_STIMULANT_DEFAULT_DOSAGE,
    },
    bloomBooster: {
      ...plant.additives.bloomBooster,
      active: nextBloomActive,
      intensity: nextBloomIntensity,
    },
    fulvicAcid: {
      ...plant.additives.fulvicAcid,
      active: shouldDisableFulvic ? false : plant.additives.fulvicAcid.active,
      startedAt: shouldDisableFulvic ? undefined : plant.additives.fulvicAcid.startedAt,
      dosageMlPerLiter:
        plant.additives.fulvicAcid.dosageMlPerLiter ?? FULVIC_ACID_DEFAULT_DOSAGE,
    },
  };

  const logs: WateringLogEntry[] = Array.isArray(plant.logs)
    ? [...plant.logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return {
    ...plant,
    additives,
    logs,
    updatedAt: new Date().toISOString(),
  };
};

const createDefaultPlants = (): PlantState[] =>
  INITIAL_PLANT_NAMES.map((name, index) => ({
    id: `plant-${index + 1}`,
    name,
    stageId: FEEDING_STAGES[0].id,
    strength: 75,
    preferredWaterLiters: 3,
    additives: createInitialAdditives(),
    updatedAt: new Date().toISOString(),
    logs: [],
    archivedAt: undefined,
  }));

interface PlantContextValue {
  plants: PlantState[];
  loading: boolean;
  refresh: () => Promise<void>;
  addPlant: (name?: string) => void;
  updatePlant: (id: string, updater: (plant: PlantState) => PlantState) => void;
  deletePlant: (id: string) => void;
  logWatering: (id: string, log: WateringLogEntry) => void;
  archivePlant: (id: string, archived: boolean) => void;
  updateWateringLog: (
    plantId: string,
    logId: string,
    updater: (entry: WateringLogEntry) => WateringLogEntry
  ) => void;
  deleteWateringLog: (plantId: string, logId: string) => void;
}

const PlantContext = createContext<PlantContextValue | undefined>(undefined);

export const PlantProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [plants, setPlants] = useState<PlantState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlants = async () => {
      const stored = await storageGet<PlantState[]>(STORAGE_KEY);
      if (stored && stored.length > 0) {
        const normalized = stored.map(normalizePlant);
        setPlants(normalized);
        await storageSet(STORAGE_KEY, normalized);
      } else {
        const defaults = createDefaultPlants().map(normalizePlant);
        setPlants(defaults);
        await storageSet(STORAGE_KEY, defaults);
      }
      setLoading(false);
    };

    loadPlants();
  }, []);

  const refresh = useCallback(async () => {
    const stored = await storageGet<PlantState[]>(STORAGE_KEY);
    if (stored) {
      const normalized = stored.map(normalizePlant);
      setPlants(normalized);
      await storageSet(STORAGE_KEY, normalized);
    }
  }, []);

  const addPlant = useCallback(
    (name?: string) => {
      setPlants(prev => {
        const newPlant: PlantState = normalizePlant({
          id: `plant-${Date.now()}`,
          name: name ?? `Plant ${prev.length + 1}`,
          stageId: FEEDING_STAGES[0].id,
          strength: 75,
          preferredWaterLiters: 3,
          additives: createInitialAdditives(),
          updatedAt: new Date().toISOString(),
          archivedAt: undefined,
        });
        const next = [...prev, newPlant];
        storageSet(STORAGE_KEY, next);
        return next;
      });
    },
    []
  );

  const updatePlant = useCallback((id: string, updater: (plant: PlantState) => PlantState) => {
    setPlants(prev => {
      const next = prev.map(plant => {
        if (plant.id !== id) return plant;
        const updated = normalizePlant(updater(plant));

        return updated;
      });

      storageSet(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const deletePlant = useCallback((id: string) => {
    setPlants(prev => {
      const next = prev.filter(plant => plant.id !== id);
      storageSet(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const logWatering = useCallback((id: string, log: WateringLogEntry) => {
    setPlants(prev => {
      const next = prev.map(plant => {
        if (plant.id !== id) return plant;
        const logs = [log, ...plant.logs];
        const updated = normalizePlant({ ...plant, logs });
        return updated;
      });

      storageSet(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const archivePlant = useCallback((id: string, archived: boolean) => {
    setPlants(prev => {
      const next = prev.map(plant => {
        if (plant.id !== id) return plant;
        const archivedAt = archived ? plant.archivedAt ?? new Date().toISOString() : undefined;
        return normalizePlant({ ...plant, archivedAt });
      });

      storageSet(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const updateWateringLog = useCallback(
    (plantId: string, logId: string, updater: (entry: WateringLogEntry) => WateringLogEntry) => {
      setPlants(prev => {
        const next = prev.map(plant => {
          if (plant.id !== plantId) return plant;
          const logs = plant.logs.map(log => {
            if (log.id !== logId) return log;
            return updater(log);
          });
          const updated = normalizePlant({ ...plant, logs });
          return updated;
        });

        storageSet(STORAGE_KEY, next);
        return next;
      });
    },
    []
  );

  const deleteWateringLog = useCallback((plantId: string, logId: string) => {
    setPlants(prev => {
      const next = prev.map(plant => {
        if (plant.id !== plantId) return plant;
        const logs = plant.logs.filter(log => log.id !== logId);
        const updated = normalizePlant({ ...plant, logs });
        return updated;
      });

      storageSet(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<PlantContextValue>(
    () => ({
      plants,
      loading,
      refresh,
      addPlant,
      updatePlant,
      deletePlant,
      logWatering,
      archivePlant,
      updateWateringLog,
      deleteWateringLog,
    }),
    [
      plants,
      loading,
      refresh,
      addPlant,
      updatePlant,
      deletePlant,
      logWatering,
      archivePlant,
      updateWateringLog,
      deleteWateringLog,
    ]
  );

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};

export const usePlants = (): PlantContextValue => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};
