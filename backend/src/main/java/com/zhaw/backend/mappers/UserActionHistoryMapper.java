package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.entities.UserActionHistory;

import java.util.List;

public final class UserActionHistoryMapper {

    public static UserActionHistoryDto toDto(UserActionHistory entity) {
        return UserActionHistoryDto.builder()
                .actionId(entity.getActionId())
                .description(entity.getDescription())
                .displayName(entity.getDisplayName())
                .points(entity.getPoints())
                .tags(entity.getTags())
                .validUntil(entity.getValidUntil())
                .actionCreatedOn(entity.getActionCreatedOn())
                .completionState(entity.getCompletionState())
                .isSubtask(entity.getIsSubtask())
                .subactionId(entity.getSubactionId())
                .mappingCreatedOn(entity.getMappingCreatedOn())
                .build();
    }

    public static List<UserActionHistoryDto> toDtoList(List<UserActionHistory> entities) {
        return entities.stream().map(UserActionHistoryMapper::toDto).toList();
    }
}