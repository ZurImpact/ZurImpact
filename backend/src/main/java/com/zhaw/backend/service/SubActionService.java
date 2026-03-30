package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.dto.SubActionDto;

import java.util.List;

public interface SubActionService {

    List<Long> getSubActionIds(Long actionId, ActionType actionType) throws Exception;

    List<SubActionDto> getSubActions(Long actionId, ActionType actionType) throws Exception;

    boolean validateCompletionForSubaction(Long userId, Long actionId,ActionType type ,String subactionId, Float gpsx, Float gpsy) throws Exception;

}
