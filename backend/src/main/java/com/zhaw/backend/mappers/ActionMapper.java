package com.zhaw.backend.mappers;

import com.zhaw.backend.enums.Tags;
import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.model.entities.Action;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class ActionMapper {

    public static ActionDto toDto(Action entity) {
        if (entity == null) {
            return null;
        }

        return ActionDto.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .displayName(entity.getDisplayName())
                .points(entity.getPoints())
                .tags(toTagList(entity.getTags()))
                .type(entity.getType())
                .hasSubtasks(entity.getHasSubtasks())
                .validUntil(entity.getValidUntil())
                .createdOn(entity.getCreatedOn())
                .build();
    }

    public static Action toEntity(ActionDto dto) {
        if (dto == null) {
            return null;
        }

        return Action.builder()
                .id(dto.getId())
                .description(dto.getDescription())
                .displayName(dto.getDisplayName())
                .points(dto.getPoints())
                .tags(toTagString(dto.getTags()))
                .type(dto.getType())
                .hasSubtasks(dto.getHasSubtasks())
                .validUntil(dto.getValidUntil())
                .createdOn(dto.getCreatedOn())
                .build();
    }

    public static List<ActionDto> toDtoList(List<Action> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(ActionMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<Action> toEntityList(List<ActionDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(ActionMapper::toEntity)
                .collect(Collectors.toList());
    }

    static List<Tags> toTagList(String tags) {
        if (tags == null || tags.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> Tags.valueOf(value.toUpperCase()))
                .collect(Collectors.toList());
    }

    static String toTagString(List<Tags> tags) {
        if (tags == null || tags.isEmpty()) {
            return "";
        }
        return tags.stream()
                .filter(Objects::nonNull)
                .map(Enum::name)
                .collect(Collectors.joining(","));
    }
}
