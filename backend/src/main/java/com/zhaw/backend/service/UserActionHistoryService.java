package com.zhaw.backend.service;

import com.zhaw.backend.model.dto.UserActionHistoryDto;

import java.util.List;

public interface UserActionHistoryService {

    List<UserActionHistoryDto> getUserActions(Long userId, Boolean active);
}
