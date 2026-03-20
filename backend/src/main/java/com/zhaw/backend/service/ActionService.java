package com.zhaw.backend.service;

import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.dto.filters.ActionFilterDto;

import java.time.LocalDateTime;
import java.util.List;

public interface ActionService {

    List<ActionDto> getActions(String text, Integer points, String tags, LocalDateTime validUntil);

    ActionDto getActionById(Long actionId);

    List<UserActionHistoryDto> getUserActions(Long UserId);

    boolean startActionForUser(Long userId, Long actionId);

    boolean completeActionForUser(Long userId, Long actionId);

    boolean deleteActionForUser(Long userId, Long actionId);
}
