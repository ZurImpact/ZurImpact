package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.filters.ActionFilterDto;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class ActionFilterMapper {

    public static ActionFilterDto fromRequest(String text, Integer points, String tags, LocalDateTime validUntil) {
        return ActionFilterDto.builder()
                .text(text)
                .points(points)
                .tags(parseTags(tags))
                .validUntil(validUntil)
                .build();
    }

    static List<String> parseTags(String tags) {
        if (tags == null || tags.trim().isEmpty()) {
            return null;
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toList());
    }
}