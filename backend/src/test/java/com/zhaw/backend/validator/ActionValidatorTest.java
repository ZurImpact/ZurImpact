package com.zhaw.backend.validator;

import com.zhaw.backend.enums.CompletionState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

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
        assertTrue(ActionValidator.validateActionCompletion(Map.of()));
    }

    @Test
    @DisplayName("validateActionCompletion returns true when all subactions are COMPLETED")
    void validateActionCompletionReturnsTrueWhenAllSubactionsAreCompleted() {
        Map<Long, CompletionState> completionStates = Map.of(
                1L, CompletionState.COMPLETED,
                2L, CompletionState.COMPLETED
        );

        assertTrue(ActionValidator.validateActionCompletion(completionStates));
    }

    @Test
    @DisplayName("validateActionCompletion returns false when one subaction is IN_PROGRESS")
    void validateActionCompletionReturnsFalseWhenAnySubactionIsNotCompleted() {
        Map<Long, CompletionState> completionStates = Map.of(
                1L, CompletionState.COMPLETED,
                2L, CompletionState.IN_PROGRESS
        );

        assertFalse(ActionValidator.validateActionCompletion(completionStates));
    }
}
