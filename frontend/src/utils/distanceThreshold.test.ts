import {describe, it, expect} from 'vitest';
import {thresholdToMeters, THRESHOLD_LEVELS} from './distanceThreshold';

describe('distanceThreshold', () => {
  describe('thresholdToMeters', () => {
    it('EASY returns 20', () => {
      expect(thresholdToMeters('EASY')).toBe(20);
    });

    it('MEDIUM returns 12.5', () => {
      expect(thresholdToMeters('MEDIUM')).toBe(12.5);
    });

    it('HARD returns 5', () => {
      expect(thresholdToMeters('HARD')).toBe(5);
    });
  });

  describe('THRESHOLD_LEVELS', () => {
    it('contains exactly EASY, MEDIUM, HARD in that order', () => {
      expect(THRESHOLD_LEVELS).toEqual(['EASY', 'MEDIUM', 'HARD']);
    });
  });
});
