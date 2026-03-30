package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.dto.SubActionDto;

import java.util.List;

public interface SubActionService {

    List<Long> getSubActionIds(Long actionId, ActionType actionType) throws Exception;

    List<SubActionDto> getSubActions(Long actionId, ActionType actionType) throws Exception;

    boolean completeSubActionForUser(Long userID, Long actionId, Long subActionId, ActionType subActionType, Float gpsX, Float gpsY) throws Exception;
}
