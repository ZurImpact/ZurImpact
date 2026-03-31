package com.zhaw.backend.mappers;

import org.junit.jupiter.api.Test;

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
}
