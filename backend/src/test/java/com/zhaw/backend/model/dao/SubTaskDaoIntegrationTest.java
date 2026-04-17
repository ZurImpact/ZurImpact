package com.zhaw.backend.model.dao;

import com.zhaw.backend.config.DockerAvailableCondition;
import com.zhaw.backend.config.TestDatabaseConfig;
import com.zhaw.backend.config.TestDataHelper;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.enums.DistanceThresholdLevel;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@Transactional
@DisplayName("SubTaskDao – Integration Tests (Testcontainers PostgreSQL)")
class SubTaskDaoIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private SubTaskDao subTaskDao;
    private Long actionId;
    private Long userId;

    @BeforeEach
    void setUp() {
        subTaskDao = new SubTaskDao(jdbcTemplate);
        actionId = TestDataHelper.insertAction(jdbcTemplate);
        Long addressId = TestDataHelper.insertAddress(jdbcTemplate);
        userId = TestDataHelper.insertUser(jdbcTemplate, addressId);
    }

    // ── Helper ──────────────────────────────────────────────────────────

    private GpsActionTaskDto buildGpsDto(double lat, double lon) {
        GpsActionTaskDto dto = new GpsActionTaskDto();
        dto.setDescription("GPS checkpoint");
        dto.setDisplayName("Checkpoint");
        dto.setLatitude(lat);
        dto.setLongitude(lon);
        dto.setDistanceThresholdLevel(DistanceThresholdLevel.MEDIUM);
        return dto;
    }

    private Long insertGpsSubTask(double lat, double lon) {
        subTaskDao.createGpsSubTask(actionId, buildGpsDto(lat, lon));
        List<GpsActionTask> tasks = subTaskDao.findGpsSubTask(actionId);
        return tasks.getLast().getId();
    }

    // ── findGpsSubTask ──────────────────────────────────────────────────

    @Nested
    @DisplayName("findGpsSubTask")
    class FindGpsSubTask {

        @Test
        @DisplayName("returns list with inserted subtasks")
        void returnsInsertedSubtasks() {
            subTaskDao.createGpsSubTask(actionId, buildGpsDto(47.3, 8.5));
            subTaskDao.createGpsSubTask(actionId, buildGpsDto(47.4, 8.6));

            List<GpsActionTask> result = subTaskDao.findGpsSubTask(actionId);

            assertEquals(2, result.size());
            assertTrue(result.stream().allMatch(t -> t.getActionId().equals(actionId)));
        }

        @Test
        @DisplayName("returns empty list when action has no subtasks")
        void returnsEmptyForActionWithoutSubtasks() {
            List<GpsActionTask> result = subTaskDao.findGpsSubTask(actionId);

            assertTrue(result.isEmpty());
        }
    }

    // ── findGpsSubTaskById ──────────────────────────────────────────────

    @Nested
    @DisplayName("findGpsSubTaskById")
    class FindGpsSubTaskById {

        @Test
        @DisplayName("returns the correct subtask by ID")
        void returnsCorrectSubtask() {
            Long id = insertGpsSubTask(47.3, 8.5);

            GpsActionTask found = subTaskDao.findGpsSubTaskById(id);

            assertNotNull(found);
            assertEquals(id, found.getId());
            assertEquals(47.3, found.getLatitude(), 0.001);
            assertEquals(8.5, found.getLongitude(), 0.001);
        }

        @Test
        @DisplayName("throws EmptyResultDataAccessException for non-existent ID")
        void throwsForNonExistentId() {
            assertThrows(EmptyResultDataAccessException.class,
                    () -> subTaskDao.findGpsSubTaskById(999999L));
        }
    }

    // ── completeSubTaskForUser ──────────────────────────────────────────

    @Nested
    @DisplayName("completeSubTaskForUser")
    class CompleteSubTaskForUser {

        @Test
        @DisplayName("inserts COMPLETED mapping for user+action+subtask")
        void insertsCompletedMapping() {
            Long subTaskId = insertGpsSubTask(47.0, 8.0);

            boolean result = subTaskDao.completeSubTaskForUser(userId, actionId, true, subTaskId.toString());

            assertTrue(result);
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM user_action_mapping WHERE user_id=? AND action_id=? AND completion_state=? AND is_subtask=true",
                    Integer.class, userId, actionId, CompletionState.COMPLETED.name());
            assertEquals(1, count);
        }
    }

    // ── findSubTaskCompletionStates ─────────────────────────────────────

    @Nested
    @DisplayName("findSubTaskCompletionStates")
    class FindSubTaskCompletionStates {

        @Test
        @DisplayName("returns map with subtask completion states")
        void returnsCompletionStateMap() {
            Long subTaskId = insertGpsSubTask(47.0, 8.0);
            subTaskDao.completeSubTaskForUser(userId, actionId, true, subTaskId.toString());

            Map<Long, CompletionState> result = subTaskDao.findSubTaskCompletionStates(userId, actionId);

            assertFalse(result.isEmpty());
            assertEquals(CompletionState.COMPLETED, result.get(subTaskId));
        }

        @Test
        @DisplayName("returns empty map when no subtask mappings exist")
        void returnsEmptyMapWhenNoMappings() {
            Map<Long, CompletionState> result = subTaskDao.findSubTaskCompletionStates(userId, actionId);

            assertTrue(result.isEmpty());
        }
    }

    // ── createGpsSubTask ────────────────────────────────────────────────

    @Nested
    @DisplayName("createGpsSubTask")
    class CreateGpsSubTask {

        @Test
        @DisplayName("persists the subtask and it can be retrieved")
        void persistsSubtask() {
            subTaskDao.createGpsSubTask(actionId, buildGpsDto(47.5, 8.7));

            List<GpsActionTask> result = subTaskDao.findGpsSubTask(actionId);

            assertEquals(1, result.size());
            assertEquals(47.5, result.getFirst().getLatitude(), 0.001);
            assertEquals(8.7, result.getFirst().getLongitude(), 0.001);
            assertEquals("MEDIUM", result.getFirst().getDistanceThresholdLevel());
        }
    }

    // ── updateGpsSubTask ────────────────────────────────────────────────

    @Nested
    @DisplayName("updateGpsSubTask")
    class UpdateGpsSubTask {

        @Test
        @DisplayName("returns true and updates fields for existing subtask")
        void returnsTrueAndUpdates() {
            Long id = insertGpsSubTask(47.0, 8.0);

            GpsActionTaskDto updated = buildGpsDto(48.0, 9.0);
            updated.setDistanceThresholdLevel(DistanceThresholdLevel.HARD);

            boolean result = subTaskDao.updateGpsSubTask(id, updated);

            assertTrue(result);
            GpsActionTask found = subTaskDao.findGpsSubTaskById(id);
            assertEquals(48.0, found.getLatitude(), 0.001);
            assertEquals(9.0, found.getLongitude(), 0.001);
        }

        @Test
        @DisplayName("returns false for non-existent subtask ID")
        void returnsFalseForNonExistent() {
            GpsActionTaskDto dto = buildGpsDto(47.0, 8.0);

            assertFalse(subTaskDao.updateGpsSubTask(999999L, dto));
        }
    }

    // ── deleteSubTask ───────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteSubTask")
    class DeleteSubTask {

        @Test
        @DisplayName("returns true and removes subtask")
        void returnsTrueAndRemoves() {
            Long id = insertGpsSubTask(47.0, 8.0);

            assertTrue(subTaskDao.deleteSubTask(id));
            assertTrue(subTaskDao.findGpsSubTask(actionId).isEmpty());
        }

        @Test
        @DisplayName("returns false for non-existent subtask ID")
        void returnsFalseForNonExistent() {
            assertFalse(subTaskDao.deleteSubTask(999999L));
        }
    }
}
