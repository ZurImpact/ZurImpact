package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.filters.ActionFilterDto;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ActionFilterMapperTest {

    @Test
    void fromRequest_mapsFields_andParsesTags() {
        LocalDateTime validUntil = LocalDateTime.of(2026, 3, 20, 12, 0);

        ActionFilterDto dto = ActionFilterMapper.fromRequest(
                "text",
                10,
                " food, ,travel,  , eco ",
                validUntil
        );

        assertNotNull(dto);
        assertEquals("text", dto.getText());
        assertEquals(10, dto.getPoints());
        assertEquals(List.of("food", "travel", "eco"), dto.getTags());
        assertEquals(validUntil, dto.getValidUntil());
    }

    @Test
    void parseTags_nullOrBlank_returnsNull() {
        assertNull(ActionFilterMapper.parseTags(null));
        assertNull(ActionFilterMapper.parseTags(""));
        assertNull(ActionFilterMapper.parseTags("   "));
    }

    @Test
    void parseTags_splitsTrimsAndFiltersEmpty() {
        List<String> tags = ActionFilterMapper.parseTags("a, , b ,,c ");

        assertEquals(List.of("a", "b", "c"), tags);
    }
}

