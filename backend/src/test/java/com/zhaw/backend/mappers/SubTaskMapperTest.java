package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubTaskDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import com.zhaw.backend.model.entities.SubTask;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SubTaskMapperTest {

    @Test
    void gpsActionTaskToDto_null_returnsNull() {
        assertNull(SubTaskMapper.GpsActionTaskToDto(null));
    }

    @Test
    void gpsActionTaskToEntity_null_returnsNull() {
        assertNull(SubTaskMapper.GpsActionTaskToEntity(null));
    }

    @Test
    void gpsActionTaskToDto_mapsGpsAndCommonFields() {
        GpsActionTask entity = new GpsActionTask();
        entity.setId(5L);
        entity.setDescription("desc");
        entity.setDisplayName("display");
        entity.setActionId(9L);
        entity.setLatitude(1.5);
        entity.setLongitude(2.5);

        SubTaskDto dto = SubTaskMapper.GpsActionTaskToDto(entity);

        assertInstanceOf(GpsActionTaskDto.class, dto);
        GpsActionTaskDto gpsDto = (GpsActionTaskDto) dto;
        assertEquals(5L, gpsDto.getId());
        assertEquals("desc", gpsDto.getDescription());
        assertEquals("display", gpsDto.getDisplayName());
        assertEquals(9L, gpsDto.getActionId());
        assertEquals(1.5, gpsDto.getLatitude());
        assertEquals(2.5, gpsDto.getLongitude());
    }

    @Test
    void gpsActionTaskToEntity_mapsGpsAndCommonFields() {
        GpsActionTaskDto dto = new GpsActionTaskDto();
        dto.setId(7L);
        dto.setDescription("desc");
        dto.setDisplayName("display");
        dto.setActionId(11L);
        dto.setLatitude(4.0);
        dto.setLongitude(5.0);

        SubTask entity = SubTaskMapper.GpsActionTaskToEntity(dto);

        assertInstanceOf(GpsActionTask.class, entity);
        GpsActionTask gpsEntity = (GpsActionTask) entity;
        assertEquals(7L, gpsEntity.getId());
        assertEquals("desc", gpsEntity.getDescription());
        assertEquals("display", gpsEntity.getDisplayName());
        assertEquals(11L, gpsEntity.getActionId());
        assertEquals(4.0, gpsEntity.getLatitude());
        assertEquals(5.0, gpsEntity.getLongitude());
    }

    @Test
    void subTaskToDto_mapsCommonFields() {
        SubTask entity = new SubTask();
        entity.setId(1L);
        entity.setDescription("desc");
        entity.setDisplayName("display");
        entity.setActionId(2L);

        SubTaskDto dto = SubTaskMapper.GpsActionTaskToDto(entity);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("desc", dto.getDescription());
        assertEquals("display", dto.getDisplayName());
        assertEquals(2L, dto.getActionId());
    }

    @Test
    void subTaskDtoToEntity_mapsCommonFields() {
        SubTaskDto dto = new SubTaskDto();
        dto.setId(3L);
        dto.setDescription("desc");
        dto.setDisplayName("display");
        dto.setActionId(4L);

        SubTask entity = SubTaskMapper.GpsActionTaskToEntity(dto);

        assertNotNull(entity);
        assertEquals(3L, entity.getId());
        assertEquals("desc", entity.getDescription());
        assertEquals("display", entity.getDisplayName());
        assertEquals(4L, entity.getActionId());
    }

    @Test
    void gpsActionTaskToDtoList_filtersNulls_andMaps() {
        SubTaskDto dto = SubTaskMapper.GpsActionTaskToDto(new SubTask());
        List<SubTaskDto> dtos = SubTaskMapper.GpsActionTaskToDtoList(List.of(new GpsActionTask()));

        assertNotNull(dto);
        assertEquals(1, dtos.size());
    }

    @Test
    void gpsActionTaskToEntityList_filtersNulls_andMaps() {
        GpsActionTaskDto gpsDto = new GpsActionTaskDto();
        gpsDto.setLatitude(1.0);
        gpsDto.setLongitude(2.0);

        List<SubTask> entities = SubTaskMapper.GpsActionTaskToEntityList(List.of(gpsDto));

        assertEquals(1, entities.size());
        assertInstanceOf(GpsActionTask.class, entities.getFirst());
    }

    @Test
    void gpsActionTaskToDtoList_nullOrEmpty_returnsEmptyList() {
        assertTrue(SubTaskMapper.GpsActionTaskToDtoList(null).isEmpty());
        assertTrue(SubTaskMapper.GpsActionTaskToDtoList(List.of()).isEmpty());
    }

    @Test
    void gpsActionTaskToEntityList_nullOrEmpty_returnsEmptyList() {
        assertTrue(SubTaskMapper.GpsActionTaskToEntityList(null).isEmpty());
        assertTrue(SubTaskMapper.GpsActionTaskToEntityList(List.of()).isEmpty());
    }
}

