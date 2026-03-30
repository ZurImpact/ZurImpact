package com.zhaw.backend.validator;

import com.zhaw.backend.enums.CompletionState;

import java.util.List;
import java.util.Map;

/**
 * Validator Class to validate States of actions
 */
public class ActionValidator {
    /**
     * Checks if all subTasks of an action are completed, if there are any subTasks. If there are no subTasks, it returns true.
     * @param completionStates List of Maps with the completion states of the subTasks, where the key is the subTask id and the value is the completion state of the subTask
     * @return returns true if all subTasks are completed or if there are no subTasks, false otherwise
     */
    public static boolean validateActionCompletion(List<Map<String, CompletionState>> completionStates) {
        if(completionStates == null || completionStates.isEmpty()) {
            return true;
        }
        for(Map<String, CompletionState> subActionCompletionState : completionStates) {
            if(subActionCompletionState == null || subActionCompletionState.isEmpty()) continue;
            for(CompletionState state : subActionCompletionState.values()) {
                if(state != CompletionState.COMPLETED) {
                    return false;
                }
            }
        }
        return true;
    }
}
