package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubActionDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import com.zhaw.backend.model.entities.SubAction;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class SubActionMapper {

    public static SubActionDto GpsActionTaskToDto(SubAction entity) {
        if (entity == null) {
            return null;
        }

        if (entity instanceof GpsActionTask gpsActionTask) {
            GpsActionTaskDto dto = new GpsActionTaskDto();
            mapCommonFields(gpsActionTask, dto);
            dto.setGpsX(gpsActionTask.getGpsX());
            dto.setGpsY(gpsActionTask.getGpsY());
            return dto;
        }

        SubActionDto dto = new SubActionDto();
        mapCommonFields(entity, dto);
        return dto;
    }

    public static SubAction GpsActionTaskToEntity(SubActionDto dto) {
        if (dto == null) {
            return null;
        }

        if (dto instanceof GpsActionTaskDto gpsDto) {
            GpsActionTask entity = new GpsActionTask();
            mapCommonFields(gpsDto, entity);
            entity.setGpsX(gpsDto.getGpsX());
            entity.setGpsY(gpsDto.getGpsY());
            return entity;
        }

        SubAction entity = new SubAction();
        mapCommonFields(dto, entity);
        return entity;
    }

    public static List<SubActionDto> GpsActionTaskToDtoList(List<? extends SubAction> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(SubActionMapper::GpsActionTaskToDto)
                .collect(Collectors.toList());
    }

    public static List<SubAction> GpsActionTaskToEntityList(List<? extends SubActionDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(SubActionMapper::GpsActionTaskToEntity)
                .collect(Collectors.toList());
    }

    private static void mapCommonFields(SubAction source, SubActionDto target) {
        target.setId(source.getId());
        target.setDescription(source.getDescription());
        target.setDisplayName(source.getDisplayName());
        target.setActionId(source.getActionId());
    }

    private static void mapCommonFields(SubActionDto source, SubAction target) {
        target.setId(source.getId());
        target.setDescription(source.getDescription());
        target.setDisplayName(source.getDisplayName());
        target.setActionId(source.getActionId());
    }
}
