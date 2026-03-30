package com.zhaw.backend.validator;

import com.zhaw.backend.enums.CompletionState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ActionValidatorTest {

	@Test
	@DisplayName("validateActionCompletion returns true when completion states are null")
	void validateActionCompletionReturnsTrueWhenInputIsNull() {
		assertTrue(ActionValidator.validateActionCompletion(null));
	}

	@Test
	@DisplayName("validateActionCompletion returns true when completion states are empty")
	void validateActionCompletionReturnsTrueWhenInputIsEmpty() {
		assertTrue(ActionValidator.validateActionCompletion(List.of()));
	}

	@Test
	@DisplayName("validateActionCompletion returns true when all subactions are COMPLETED")
	void validateActionCompletionReturnsTrueWhenAllSubactionsAreCompleted() {
		List<Map<String, CompletionState>> completionStates = List.of(
				Map.of("1", CompletionState.COMPLETED),
				Map.of("2", CompletionState.COMPLETED)
		);

		assertTrue(ActionValidator.validateActionCompletion(completionStates));
	}

	@Test
	@DisplayName("validateActionCompletion returns false when one subaction is IN_PROGRESS")
	void validateActionCompletionReturnsFalseWhenAnySubactionIsNotCompleted() {
		List<Map<String, CompletionState>> completionStates = List.of(
				Map.of("1", CompletionState.COMPLETED),
				Map.of("2", CompletionState.IN_PROGRESS)
		);

		assertFalse(ActionValidator.validateActionCompletion(completionStates));
	}
}
