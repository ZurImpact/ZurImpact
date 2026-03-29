package com.zhaw.backend.mappers;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class ActionFilterMapper {

    public static List<String> parseTags(String tags) {
        if (tags == null || tags.trim().isEmpty()) {
            return null;
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toList());
    }
}