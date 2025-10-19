import { FEEDING_STAGE_LOOKUP, FERTILIZER_LABELS } from '@/constants/feeding';
import { FertilizerId, PlantState } from '@/types/plant';

export interface FertilizerDose {
  fertilizer: FertilizerId;
  label: string;
  ml: number;
  mlPerLiter: number;
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
