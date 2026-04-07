package com.zhaw.backend.validator;

import com.zhaw.backend.enums.CompletionState;

import java.util.Map;

/**
 * Validator Class to validate States of actions
 */
public class ActionValidator {
    /**
     * Checks if all subTasks of an action are completed, if there are any subTasks. If there are no subTasks, it returns true.
     * @param completionStates map of subTask id to completion state
     * @return returns true if all subTasks are completed or if there are no subTasks, false otherwise
     */
    public static boolean validateActionCompletion(Map<Long, CompletionState> completionStates) {
        if(completionStates == null || completionStates.isEmpty()) {
            return true;
        }
        for(CompletionState state : completionStates.values()) {
            if(state != CompletionState.COMPLETED) {
                return false;
            }
        }
        return true;
    }
}
