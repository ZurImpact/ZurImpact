package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.dto.SubTaskCompletionRequestDto;
import com.zhaw.backend.model.dto.SubTaskDto;

import java.util.List;
import java.util.Map;

public interface SubTaskService {

    List<SubTaskDto> getSubTasks(Long actionId, ActionType actionType);

    void createSubTask(Long actionId, GpsActionTaskDto dto);

    boolean updateSubTask(Long id, GpsActionTaskDto dto);

    boolean deleteSubTask(Long id);

    Map<Long, CompletionState> getSubTasksCompletionStatesForUser(Long userId, Long actionId);

    boolean completeSubTaskForUser(SubTaskCompletionRequestDto requestDto);
}
