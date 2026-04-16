package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.filters.ActionFilterDto;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ActionFilterMapperTest {

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

    @Test
    void parseTags_commaSeparatedWithWhitespace_normalizes() {
        List<String> tags = ActionFilterMapper.parseTags(" food, ,travel,  , eco ");

        assertEquals(List.of("food", "travel", "eco"), tags);
    }

    @Test
    void fromRequest_mapsAllFields_includingParsedTags() {
        LocalDateTime validUntil = LocalDateTime.of(2026, 12, 31, 12, 0);

        ActionFilterDto dto = ActionFilterMapper.fromRequest("bike", 10, "food, travel", validUntil);

        assertEquals("bike", dto.getText());
        assertEquals(10, dto.getPoints());
        assertEquals(List.of("food", "travel"), dto.getTags());
        assertEquals(validUntil, dto.getValidUntil());
    }

    @Test
    void fromRequest_setsNullTags_whenInputTagsBlank() {
        ActionFilterDto dto = ActionFilterMapper.fromRequest("bike", 10, "   ", null);

        assertNull(dto.getTags());
        assertNull(dto.getValidUntil());
    }
}
