package com.zhaw.backend.mappers;

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
            GpsActionTaskDto dto = new GpsActionTaskDto();
            mapCommonFields(gpsActionTask, dto);
            dto.setLatitude(gpsActionTask.getLatitude());
            dto.setLongitude(gpsActionTask.getLongitude());
            return dto;
        }

        SubTaskDto dto = new SubTaskDto();
        mapCommonFields(entity, dto);
        return dto;
    }

    public static SubTask GpsActionTaskToEntity(SubTaskDto dto) {
        if (dto == null) {
            return null;
        }

        if (dto instanceof GpsActionTaskDto gpsDto) {
            GpsActionTask entity = new GpsActionTask();
            mapCommonFields(gpsDto, entity);
            entity.setLatitude(gpsDto.getLatitude());
            entity.setLongitude(gpsDto.getLongitude());
            return entity;
        }

        SubTask entity = new SubTask();
        mapCommonFields(dto, entity);
        return entity;
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

    private static void mapCommonFields(SubTask source, SubTaskDto target) {
        target.setId(source.getId());
        target.setDescription(source.getDescription());
        target.setDisplayName(source.getDisplayName());
        target.setActionId(source.getActionId());
    }

    private static void mapCommonFields(SubTaskDto source, SubTask target) {
        target.setId(source.getId());
        target.setDescription(source.getDescription());
        target.setDisplayName(source.getDisplayName());
        target.setActionId(source.getActionId());
    }
}
