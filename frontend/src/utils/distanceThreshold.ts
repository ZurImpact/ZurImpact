export type DistanceThresholdLevel = 'EASY' | 'MEDIUM' | 'HARD';

export const THRESHOLD_LEVELS: readonly DistanceThresholdLevel[] = ['EASY', 'MEDIUM', 'HARD'] as const;

const METERS_BY_LEVEL: Record<DistanceThresholdLevel, number> = {
  EASY: 20,
  MEDIUM: 12.5,
  HARD: 5,
};

export function thresholdToMeters(level: DistanceThresholdLevel): number {
  return METERS_BY_LEVEL[level];
}
