package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.entities.UserActionHistory;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class UserActionHistoryMapperTest {

    @Test
    void toDto_mapsAllFields_includingDateTimeToString() {
        LocalDateTime validUntil = LocalDateTime.of(2026, 12, 31, 23, 59);
        LocalDateTime actionCreatedOn = LocalDateTime.of(2026, 1, 1, 8, 0);
        LocalDateTime mappingCreatedOn = LocalDateTime.of(2026, 2, 1, 9, 30);

        UserActionHistory entity = UserActionHistory.builder()
                .actionId(10L)
                .description("desc")
                .displayName("display")
                .points(20)
                .tags("FOOD")
                .validUntil(validUntil)
                .actionCreatedOn(actionCreatedOn)
                .completionState("COMPLETED")
                .isSubtask(true)
                .subtaskId("42")
                .mappingCreatedOn(mappingCreatedOn)
                .build();

        UserActionHistoryDto dto = UserActionHistoryMapper.toDto(entity);

        assertEquals(10L, dto.getActionId());
        assertEquals("desc", dto.getDescription());
        assertEquals("display", dto.getDisplayName());
        assertEquals(20, dto.getPoints());
        assertEquals("FOOD", dto.getTags());
        assertEquals(validUntil.toString(), dto.getValidUntil());
        assertEquals(actionCreatedOn.toString(), dto.getActionCreatedOn());
        assertEquals("COMPLETED", dto.getCompletionState());
        assertEquals(true, dto.getIsSubtask());
        assertEquals("42", dto.getSubtaskId());
        assertEquals(mappingCreatedOn.toString(), dto.getMappingCreatedOn());
    }

    @Test
    void toDtoList_mapsAllElements() {
        UserActionHistory first = UserActionHistory.builder()
                .actionId(1L)
                .validUntil(LocalDateTime.of(2026, 1, 1, 0, 0))
                .actionCreatedOn(LocalDateTime.of(2026, 1, 1, 0, 0))
                .mappingCreatedOn(LocalDateTime.of(2026, 1, 1, 0, 0))
                .build();
        UserActionHistory second = UserActionHistory.builder()
                .actionId(2L)
                .validUntil(LocalDateTime.of(2026, 1, 2, 0, 0))
                .actionCreatedOn(LocalDateTime.of(2026, 1, 2, 0, 0))
                .mappingCreatedOn(LocalDateTime.of(2026, 1, 2, 0, 0))
                .build();

        List<UserActionHistoryDto> result = UserActionHistoryMapper.toDtoList(List.of(first, second));

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getActionId());
        assertEquals(2L, result.get(1).getActionId());
    }

    @Test
    void toDto_throwsWhenEntityIsNull() {
        assertThrows(NullPointerException.class, () -> UserActionHistoryMapper.toDto(null));
    }

    @Test
    void toDtoList_throwsWhenListIsNull() {
        assertThrows(NullPointerException.class, () -> UserActionHistoryMapper.toDtoList(null));
    }
}

