package com.zhaw.backend.mappers;

import com.zhaw.backend.enums.DistanceThresholdLevel;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubTaskDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import com.zhaw.backend.model.entities.SubTask;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class SubTaskMapper {

    public static SubTaskDto GpsActionTaskToDto(SubTask entity) {
        if (entity == null) {
            return null;
        }

        if (entity instanceof GpsActionTask gpsActionTask) {
            return GpsActionTaskDto.builder()
                    .id(gpsActionTask.getId())
                    .description(gpsActionTask.getDescription())
                    .displayName(gpsActionTask.getDisplayName())
                    .actionId(gpsActionTask.getActionId())
                    .latitude(gpsActionTask.getLatitude())
                    .longitude(gpsActionTask.getLongitude())
                    .distanceThresholdLevel(gpsActionTask.getDistanceThresholdLevel() == null ? null
                            : DistanceThresholdLevel.valueOf(gpsActionTask.getDistanceThresholdLevel()))
                    .build();
        }

        return SubTaskDto.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .displayName(entity.getDisplayName())
                .actionId(entity.getActionId())
                .build();
    }

    public static SubTask GpsActionTaskToEntity(SubTaskDto dto) {
        if (dto == null) {
            return null;
        }

        if (dto instanceof GpsActionTaskDto gpsDto) {
            return GpsActionTask.builder()
                    .id(gpsDto.getId())
                    .description(gpsDto.getDescription())
                    .displayName(gpsDto.getDisplayName())
                    .actionId(gpsDto.getActionId())
                    .latitude(gpsDto.getLatitude())
                    .longitude(gpsDto.getLongitude())
                    .distanceThresholdLevel(gpsDto.getDistanceThresholdLevel().name())
                    .build();
        }

        return SubTask.builder()
                .id(dto.getId())
                .description(dto.getDescription())
                .displayName(dto.getDisplayName())
                .actionId(dto.getActionId())
                .build();
    }

    public static List<SubTaskDto> GpsActionTaskToDtoList(List<? extends SubTask> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(SubTaskMapper::GpsActionTaskToDto)
                .collect(Collectors.toList());
    }

    public static List<SubTask> GpsActionTaskToEntityList(List<? extends SubTaskDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(SubTaskMapper::GpsActionTaskToEntity)
                .collect(Collectors.toList());
    }
}
