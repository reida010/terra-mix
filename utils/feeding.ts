import {
  BLOOM_BOOSTER_MAX_ML_PER_L,
  FEEDING_STAGE_LOOKUP,
  FERTILIZER_LABELS,
  ROOT_STIMULANT_DEFAULT_DOSAGE,
  FULVIC_ACID_DEFAULT_INTENSITY,
  FULVIC_ACID_MAX_ML_PER_L,
} from '@/constants/feeding';
import { FertilizerId, PlantState, LoggedAdditiveDose, LoggedBloomBoosterDose } from '@/types/plant';

export interface FertilizerDose {
  fertilizer: FertilizerId;
  label: string;
  ml: number;
  mlPerLiter: number;
}

export interface AdditiveDoseSummary {
  rootStimulant?: LoggedAdditiveDose;
  fulvicAcid?: LoggedAdditiveDose;
  bloomBooster?: LoggedBloomBoosterDose;
}

export function calculateFertilizerDoses(
  plant: PlantState,
  waterLiters: number
): FertilizerDose[] {
  const stage = FEEDING_STAGE_LOOKUP[plant.stageId];
  const multiplier = Math.max(0, plant.strength) / 100;

  return stage.rates.map(rate => {
    const mlPerLiter = rate.mlPerLiter * multiplier;
    const totalMl = mlPerLiter * waterLiters;
    return {
      fertilizer: rate.fertilizer,
      label: FERTILIZER_LABELS[rate.fertilizer],
      ml: Number(totalMl.toFixed(2)),
      mlPerLiter: Number(mlPerLiter.toFixed(2)),
    };
  });
}

export function formatMl(value: number): string {
  if (value < 1) {
    return `${(Math.round(value * 100) / 100).toFixed(2)} ml`;
  }
  if (value < 10) {
    return `${(Math.round(value * 10) / 10).toFixed(1)} ml`;
  }
  return `${Math.round(value)} ml`;
}

export function calculateAdditiveDoses(plant: PlantState, waterLiters: number): AdditiveDoseSummary {
  const rootMlPerLiter = plant.additives.rootStimulant.dosageMlPerLiter ?? ROOT_STIMULANT_DEFAULT_DOSAGE;
  const fulvicIntensity = plant.additives.fulvicAcid.intensity ?? FULVIC_ACID_DEFAULT_INTENSITY;
  const fulvicMlPerLiter = (fulvicIntensity / 100) * FULVIC_ACID_MAX_ML_PER_L;
  const bloomMlPerLiter = (plant.additives.bloomBooster.intensity / 100) * BLOOM_BOOSTER_MAX_ML_PER_L;
  const stageId = plant.stageId;
  const allowsRoot = stageId === 'seedling' || stageId === 'earlyGrow' || stageId === 'grow';
  const allowsFulvic = allowsRoot || stageId === 'preflower';
  const allowsBloom = stageId === 'preflower' || stageId === 'flower' || stageId === 'lateFlower' || stageId === 'ripen';

  const summary: AdditiveDoseSummary = {};

  if (allowsRoot && plant.additives.rootStimulant.active) {
    summary.rootStimulant = {
      mlPerLiter: Number(rootMlPerLiter.toFixed(2)),
      totalMl: Number((rootMlPerLiter * waterLiters).toFixed(2)),
    };
  }

  if (allowsFulvic && plant.additives.fulvicAcid.active) {
    summary.fulvicAcid = {
      intensity: Number(fulvicIntensity.toFixed(2)),
      mlPerLiter: Number(fulvicMlPerLiter.toFixed(2)),
      totalMl: Number((fulvicMlPerLiter * waterLiters).toFixed(2)),
    };
  }

  if (allowsBloom && plant.additives.bloomBooster.active && bloomMlPerLiter > 0) {
    summary.bloomBooster = {
      intensity: plant.additives.bloomBooster.intensity,
      mlPerLiter: Number(bloomMlPerLiter.toFixed(2)),
      totalMl: Number((bloomMlPerLiter * waterLiters).toFixed(2)),
    };
  }

  return summary;
}
