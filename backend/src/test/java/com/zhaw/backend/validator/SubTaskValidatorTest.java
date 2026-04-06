package com.zhaw.backend.validator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SubTaskValidatorTest {

	@Test
	@DisplayName("validateGpsSubAction returns false when one coordinate is null")
	void validateGpsSubTaskReturnsFalseWhenCoordinateIsNull() {
		boolean result = SubTaskValidator.validateGpsSubTask(null, 2.0f, 1.0f, 2.0f, 0.5f);
		assertFalse(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns true when current and target coordinates are equal")
	void validateGpsSubTaskReturnsTrueWhenCoordinatesMatchExactly() {
		boolean result = SubTaskValidator.validateGpsSubTask(10.0f, 20.0f, 10.0f, 20.0f, 0.0f);
		assertTrue(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns true when distance is below threshold")
	void validateGpsSubTaskReturnsTrueWhenDistanceIsWithinThreshold() {
		boolean result = SubTaskValidator.validateGpsSubTask(0.0f, 0.0f, 3.0f, 4.0f, 5.1f);
		assertTrue(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns true when distance is exactly on threshold")
	void validateGpsSubTaskReturnsTrueWhenDistanceEqualsThreshold() {
		boolean result = SubTaskValidator.validateGpsSubTask(0.0f, 0.0f, 3.0f, 4.0f, 5.0f);
		assertTrue(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns false when distance is above threshold")
	void validateGpsSubTaskReturnsFalseWhenDistanceExceedsThreshold() {
		boolean result = SubTaskValidator.validateGpsSubTask(0.0f, 0.0f, 3.0f, 4.0f, 4.9f);
		assertFalse(result);
	}

	@Test
	@DisplayName("validateGpsSubAction returns false for negative threshold")
	void validateGpsSubTaskReturnsFalseForNegativeThreshold() {
		boolean result = SubTaskValidator.validateGpsSubTask(0.0f, 0.0f, 0.0f, 1.0f, -1.0f);
		assertFalse(result);
	}
}
