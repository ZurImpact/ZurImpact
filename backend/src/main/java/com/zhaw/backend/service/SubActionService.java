package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.dto.SubActionCompletionRequestDto;
import com.zhaw.backend.model.dto.SubActionDto;

import java.util.List;
import java.util.Map;

public interface SubActionService {

    List<Long> getSubActionIds(Long actionId, ActionType actionType) throws Exception;

    List<SubActionDto> getSubActions(Long actionId, ActionType actionType) throws Exception;

    List<Map<String, CompletionState>> getSubActionsCompletionStatesForUser(Long userId, Long actionId);

    boolean completeSubActionForUser(SubActionCompletionRequestDto requestDto) throws Exception;
}
