package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubActionDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import com.zhaw.backend.model.entities.SubAction;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SubActionMapperTest {

    @Test
    void gpsActionTaskToDto_null_returnsNull() {
        assertNull(SubActionMapper.GpsActionTaskToDto(null));
    }

    @Test
    void gpsActionTaskToEntity_null_returnsNull() {
        assertNull(SubActionMapper.GpsActionTaskToEntity(null));
    }

    @Test
    void gpsActionTaskToDto_mapsGpsAndCommonFields() {
        GpsActionTask entity = new GpsActionTask();
        entity.setId(5L);
        entity.setDescription("desc");
        entity.setDisplayName("display");
        entity.setActionId(9L);
        entity.setGpsX(1.5f);
        entity.setGpsY(2.5f);
        entity.setGpsZ(3.5f);

        SubActionDto dto = SubActionMapper.GpsActionTaskToDto(entity);

        assertInstanceOf(GpsActionTaskDto.class, dto);
        GpsActionTaskDto gpsDto = (GpsActionTaskDto) dto;
        assertEquals(5L, gpsDto.getId());
        assertEquals("desc", gpsDto.getDescription());
        assertEquals("display", gpsDto.getDisplayName());
        assertEquals(9L, gpsDto.getActionId());
        assertEquals(1.5f, gpsDto.getGpsX());
        assertEquals(2.5f, gpsDto.getGpsY());
        assertEquals(3.5f, gpsDto.getGpsZ());
    }

    @Test
    void gpsActionTaskToEntity_mapsGpsAndCommonFields() {
        GpsActionTaskDto dto = new GpsActionTaskDto();
        dto.setId(7L);
        dto.setDescription("desc");
        dto.setDisplayName("display");
        dto.setActionId(11L);
        dto.setGpsX(4.0f);
        dto.setGpsY(5.0f);
        dto.setGpsZ(6.0f);

        SubAction entity = SubActionMapper.GpsActionTaskToEntity(dto);

        assertInstanceOf(GpsActionTask.class, entity);
        GpsActionTask gpsEntity = (GpsActionTask) entity;
        assertEquals(7L, gpsEntity.getId());
        assertEquals("desc", gpsEntity.getDescription());
        assertEquals("display", gpsEntity.getDisplayName());
        assertEquals(11L, gpsEntity.getActionId());
        assertEquals(4.0f, gpsEntity.getGpsX());
        assertEquals(5.0f, gpsEntity.getGpsY());
        assertEquals(6.0f, gpsEntity.getGpsZ());
    }

    @Test
    void subActionToDto_mapsCommonFields() {
        SubAction entity = new SubAction();
        entity.setId(1L);
        entity.setDescription("desc");
        entity.setDisplayName("display");
        entity.setActionId(2L);

        SubActionDto dto = SubActionMapper.GpsActionTaskToDto(entity);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("desc", dto.getDescription());
        assertEquals("display", dto.getDisplayName());
        assertEquals(2L, dto.getActionId());
    }

    @Test
    void subActionDtoToEntity_mapsCommonFields() {
        SubActionDto dto = new SubActionDto();
        dto.setId(3L);
        dto.setDescription("desc");
        dto.setDisplayName("display");
        dto.setActionId(4L);

        SubAction entity = SubActionMapper.GpsActionTaskToEntity(dto);

        assertNotNull(entity);
        assertEquals(3L, entity.getId());
        assertEquals("desc", entity.getDescription());
        assertEquals("display", entity.getDisplayName());
        assertEquals(4L, entity.getActionId());
    }

    @Test
    void gpsActionTaskToDtoList_filtersNulls_andMaps() {
        SubActionDto dto = SubActionMapper.GpsActionTaskToDto(new SubAction());
        List<SubActionDto> dtos = SubActionMapper.GpsActionTaskToDtoList(List.of(new GpsActionTask()));

        assertNotNull(dto);
        assertEquals(1, dtos.size());
    }

    @Test
    void gpsActionTaskToEntityList_filtersNulls_andMaps() {
        GpsActionTaskDto gpsDto = new GpsActionTaskDto();
        gpsDto.setGpsX(1.0f);
        gpsDto.setGpsY(2.0f);
        gpsDto.setGpsZ(3.0f);

        List<SubAction> entities = SubActionMapper.GpsActionTaskToEntityList(List.of(gpsDto));

        assertEquals(1, entities.size());
        assertInstanceOf(GpsActionTask.class, entities.getFirst());
    }

    @Test
    void gpsActionTaskToDtoList_nullOrEmpty_returnsEmptyList() {
        assertTrue(SubActionMapper.GpsActionTaskToDtoList(null).isEmpty());
        assertTrue(SubActionMapper.GpsActionTaskToDtoList(List.of()).isEmpty());
    }

    @Test
    void gpsActionTaskToEntityList_nullOrEmpty_returnsEmptyList() {
        assertTrue(SubActionMapper.GpsActionTaskToEntityList(null).isEmpty());
        assertTrue(SubActionMapper.GpsActionTaskToEntityList(List.of()).isEmpty());
    }
}

