import { FeedingStage, FeedingStageId, FertilizerId } from '@/types/plant';

export const FERTILIZER_LABELS: Record<FertilizerId, string> = {
  grow: 'TriPart Grow',
  micro: 'TriPart Micro',
  bloom: 'TriPart Bloom',
  finalPart: 'Final Part',
};

export const FEEDING_STAGES: FeedingStage[] = [
  {
    id: 'seedling',
    name: 'Seedlings',
    description: 'Young plants just after germination. Gentle nutrition only.',
    rates: [
      { fertilizer: 'grow', mlPerLiter: 0.6 },
      { fertilizer: 'micro', mlPerLiter: 0.4 },
      { fertilizer: 'bloom', mlPerLiter: 0.2 },
    ],
  },
  {
    id: 'earlyGrow',
    name: 'Early Grow',
    description: 'After transplant when roots are establishing.',
    rates: [
      { fertilizer: 'grow', mlPerLiter: 1.2 },
      { fertilizer: 'micro', mlPerLiter: 0.8 },
      { fertilizer: 'bloom', mlPerLiter: 0.4 },
    ],
  },
  {
    id: 'grow',
    name: 'Grow',
    description: 'Full vegetative growth with balanced nitrogen.',
    rates: [
      { fertilizer: 'grow', mlPerLiter: 1.8 },
      { fertilizer: 'micro', mlPerLiter: 1.2 },
      { fertilizer: 'bloom', mlPerLiter: 0.6 },
    ],
  },
  {
    id: 'preflower',
    name: 'Preflower',
    description: 'Transition period preparing for bloom.',
    rates: [
      { fertilizer: 'grow', mlPerLiter: 1.4 },
      { fertilizer: 'micro', mlPerLiter: 1.4 },
      { fertilizer: 'bloom', mlPerLiter: 1.0 },
    ],
  },
  {
    id: 'flower',
    name: 'Flower',
    description: 'Primary flowering stack. Focus on bloom and micronutrients.',
    rates: [
      { fertilizer: 'grow', mlPerLiter: 0.8 },
      { fertilizer: 'micro', mlPerLiter: 1.6 },
      { fertilizer: 'bloom', mlPerLiter: 2.4 },
    ],
  },
  {
    id: 'lateFlower',
    name: 'Late Flower',
    description: 'Peak bloom bulk with reduced nitrogen.',
    rates: [
      { fertilizer: 'grow', mlPerLiter: 0.6 },
      { fertilizer: 'micro', mlPerLiter: 1.2 },
      { fertilizer: 'bloom', mlPerLiter: 2.6 },
    ],
  },
  {
    id: 'ripen',
    name: 'Ripen / Final',
    description: 'Final ripening period before flush.',
    rates: [
      { fertilizer: 'finalPart', mlPerLiter: 4 },
    ],
  },
];

export const BLOOM_BOOSTER_RECOMMENDATIONS: Record<FeedingStageId, number> = {
  seedling: 0,
  earlyGrow: 0,
  grow: 10,
  preflower: 40,
  flower: 70,
  lateFlower: 85,
  ripen: 40,
};

export const ROOT_STIMULANT_DEFAULT_DURATION = 14;
export const ROOT_STIMULANT_DEFAULT_DOSAGE = 0.2;
export const FULVIC_ACID_DEFAULT_DOSAGE = 0.3;
export const BLOOM_BOOSTER_MAX_ML_PER_L = 2;

export const FEEDING_STAGE_LOOKUP = FEEDING_STAGES.reduce(
  (acc, stage) => ({ ...acc, [stage.id]: stage }),
  {} as Record<FeedingStageId, FeedingStage>
);

export const INITIAL_PLANT_NAMES = ['Plant A', 'Plant B', 'Plant C'];
