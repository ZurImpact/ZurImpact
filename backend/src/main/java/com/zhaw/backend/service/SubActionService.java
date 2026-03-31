package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubActionDto;

import java.util.List;

public interface SubActionService {

    List<SubActionDto> getSubActions(Long actionId, ActionType actionType) throws Exception;

    void createSubAction(Long actionId, GpsActionTaskDto dto);

    boolean updateSubAction(Long id, GpsActionTaskDto dto);

    boolean deleteSubAction(Long id);
}
