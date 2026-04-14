package com.zhaw.backend.validator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SubTaskValidatorTest {

	@Test
	@DisplayName("validateGpsSubAction returns false when one coordinate is null")
	void validateGpsSubTaskReturnsFalseWhenCoordinateIsNull() {
		boolean result = SubTaskValidator.validateGpsSubTask(null, 2.0, 1.0, 2.0, 0.5);
		assertFalse(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns true when current and target coordinates are equal")
	void validateGpsSubTaskReturnsTrueWhenCoordinatesMatchExactly() {
		boolean result = SubTaskValidator.validateGpsSubTask(10.0, 20.0, 10.0, 20.0, 0.0);
		assertTrue(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns true when distance is below threshold")
	void validateGpsSubTaskReturnsTrueWhenDistanceIsWithinThreshold() {
		// Two points ~11m apart (0.0001° latitude ≈ 11.1m); threshold 20m
		boolean result = SubTaskValidator.validateGpsSubTask(47.3769, 8.5417, 47.3770, 8.5417, 20.0);
		assertTrue(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns true when distance is barely within threshold")
	void validateGpsSubTaskReturnsTrueWhenDistanceBarelyWithinThreshold() {
		// Two points ~11m apart; threshold 12m
		boolean result = SubTaskValidator.validateGpsSubTask(47.3769, 8.5417, 47.3770, 8.5417, 12.0);
		assertTrue(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns false when distance is above threshold")
	void validateGpsSubTaskReturnsFalseWhenDistanceExceedsThreshold() {
		// Two points ~11m apart; threshold 10m
		boolean result = SubTaskValidator.validateGpsSubTask(47.3769, 8.5417, 47.3770, 8.5417, 10.0);
		assertFalse(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns false for negative threshold")
	void validateGpsSubTaskReturnsFalseForNegativeThreshold() {
		boolean result = SubTaskValidator.validateGpsSubTask(0.0, 0.0, 0.0, 1.0, -1.0);
		assertFalse(result);
	}
}
