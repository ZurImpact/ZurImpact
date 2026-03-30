package com.zhaw.backend.service;

import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.model.dto.UserActionHistoryDto;

import java.time.LocalDateTime;
import java.util.List;

public interface ActionService {

    List<ActionDto> getActions(String text, Integer points, String tags, LocalDateTime validUntil) throws Exception;

    ActionDto getActionById(Long actionId) throws Exception;

    List<UserActionHistoryDto> getUserActions(Long userId, Boolean active);

    boolean startActionForUser(Long userId, Long actionId, Boolean isSubtask, String subActionId);

    boolean completeActionForUser(Long userId, Long actionId) throws Exception;

    boolean deleteActionForUser(Long userId, Long actionId);
}
