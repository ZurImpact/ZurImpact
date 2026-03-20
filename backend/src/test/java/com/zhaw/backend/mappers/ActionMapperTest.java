package com.zhaw.backend.mappers;

import com.zhaw.backend.enums.Tags;
import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.model.entities.Action;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ActionMapperTest {

    @Test
    void toDto_null_returnsNull() {
        assertNull(ActionMapper.toDto(null));
    }

    @Test
    void toEntity_null_returnsNull() {
        assertNull(ActionMapper.toEntity(null));
    }

    @Test
    void toDto_mapsAllFields_andSplitsTags() {
        LocalDateTime created = LocalDateTime.of(2026, 3, 11, 10, 0);
        LocalDateTime validUntil = LocalDateTime.of(2026, 12, 31, 23, 59);

        Action entity = Action.builder()
                .id(3L)
                .description("desc")
                .displayName("display")
                .points(12)
                .tags("FOOD, DRINKS,, TRAVEL ")
                .validUntil(validUntil)
                .createdOn(created)
                .build();

        ActionDto dto = ActionMapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getDescription(), dto.getDescription());
        assertEquals(entity.getDisplayName(), dto.getDisplayName());
        assertEquals(entity.getPoints(), dto.getPoints());
        assertEquals(List.of(Tags.FOOD, Tags.DRINKS, Tags.TRAVEL), dto.getTags());
        assertEquals(entity.getValidUntil(), dto.getValidUntil());
        assertEquals(entity.getCreatedOn(), dto.getCreatedOn());
    }

    @Test
    void toEntity_mapsAllFields_andJoinsTags() {
        LocalDateTime created = LocalDateTime.of(2026, 3, 11, 10, 0);
        LocalDateTime validUntil = LocalDateTime.of(2026, 12, 31, 23, 59);

        ActionDto dto = ActionDto.builder()
                .id(4L)
                .description("desc")
                .displayName("display")
                .points(20)
                .tags(Arrays.asList(Tags.FOOD, null, Tags.DRINKS))
                .validUntil(validUntil)
                .createdOn(created)
                .build();

        Action entity = ActionMapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals(dto.getId(), entity.getId());
        assertEquals(dto.getDescription(), entity.getDescription());
        assertEquals(dto.getDisplayName(), entity.getDisplayName());
        assertEquals(dto.getPoints(), entity.getPoints());
        assertEquals("FOOD,DRINKS", entity.getTags());
        assertEquals(dto.getValidUntil(), entity.getValidUntil());
        assertEquals(dto.getCreatedOn(), entity.getCreatedOn());
    }

    @Test
    void toDtoList_filtersNulls_andMaps() {
        Action a = Action.builder()
                .id(1L)
                .description("d")
                .displayName("n")
                .points(1)
                .tags("FOOD")
                .validUntil(LocalDateTime.now())
                .build();

        List<ActionDto> dtos = ActionMapper.toDtoList(Arrays.asList(a, null));

        assertEquals(1, dtos.size());
        assertEquals(1L, dtos.getFirst().getId());
    }

    @Test
    void toEntityList_filtersNulls_andMaps() {
        ActionDto a = ActionDto.builder()
                .id(1L)
                .description("d")
                .displayName("n")
                .points(1)
                .tags(List.of(Tags.FOOD))
                .validUntil(LocalDateTime.now())
                .build();

        List<Action> entities = ActionMapper.toEntityList(Arrays.asList(a, null));

        assertEquals(1, entities.size());
        assertEquals(1L, entities.getFirst().getId());
    }
}
