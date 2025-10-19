export type FertilizerId = 'grow' | 'micro' | 'bloom';

export type FeedingStageId =
  | 'seedling'
  | 'earlyGrow'
  | 'grow'
  | 'preflower'
  | 'flower'
  | 'lateFlower'
  | 'ripen';

export interface FertilizerRate {
  fertilizer: FertilizerId;
  mlPerLiter: number;
}

export interface FeedingStage {
  id: FeedingStageId;
  name: string;
  description: string;
  rates: FertilizerRate[];
}

export interface RootStimulantState {
  active: boolean;
  startDate?: string;
  durationDays: number;
}

export interface FulvicAcidState {
  active: boolean;
  startedAt?: string;
}

export interface BloomBoosterState {
  active: boolean;
  intensity: number; // percentage 0 - 100
  lastAdjustedAt?: string;
}

export interface AdditivesState {
  rootStimulant: RootStimulantState;
  fulvicAcid: FulvicAcidState;
  bloomBooster: BloomBoosterState;
}

export interface PlantState {
  id: string;
  name: string;
  stageId: FeedingStageId;
  strength: number; // percentage of max, e.g. 80 -> 80%
  preferredWaterLiters: number;
  additives: AdditivesState;
  updatedAt: string;
}
