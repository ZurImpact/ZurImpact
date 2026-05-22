package com.zhaw.backend.model.dao;

import com.zhaw.backend.config.DockerAvailableCondition;
import com.zhaw.backend.config.TestDatabaseConfig;
import com.zhaw.backend.config.TestDataHelper;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.entities.UserActionHistory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@Transactional
@DisplayName("UserActionHistoryDao – Integration Tests (Testcontainers PostgreSQL)")
class UserActionHistoryDaoIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private UserActionHistoryDao historyDao;
    private ActionDao actionDao;
    private Long userId;
    private Long actionId;

    @BeforeEach
    void setUp() {
        historyDao = new UserActionHistoryDao(jdbcTemplate);
        actionDao = new ActionDao(jdbcTemplate);
        Long addressId = TestDataHelper.insertAddress(jdbcTemplate);
        userId = TestDataHelper.insertUser(jdbcTemplate, addressId);
        actionId = TestDataHelper.insertAction(jdbcTemplate);
    }

    // ── Helper ──────────────────────────────────────────────────────────

    private void insertMapping(Long userId, Long actionId, CompletionState state) {
        insertMapping(userId, actionId, state, false, null);
    }

    private void insertMapping(Long userId, Long actionId, CompletionState state, boolean isSubtask, String subtaskId) {
        jdbcTemplate.update(
                "INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask, subtask_id) VALUES (?,?,?,?,?,?)",
                userId, actionId, state.name(), Timestamp.valueOf(LocalDateTime.now()), isSubtask, subtaskId);
    }

    // ── findUserActionHistory ────────────────────────────────────────────

    @Nested
    @DisplayName("findUserActionHistory")
    class FindUserActionHistory {

        @Test
        @DisplayName("returns all mappings when active is null")
        void returnsAllWhenActiveNull() {
            insertMapping(userId, actionId, CompletionState.COMPLETED);
            Long actionId2 = TestDataHelper.insertAction(jdbcTemplate);
            insertMapping(userId, actionId2, CompletionState.COMPLETED);

            List<UserActionHistory> result = historyDao.findUserActionHistory(userId, false);

            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("returns only IN_PROGRESS when active is true")
        void returnsOnlyInProgressWhenActiveTrue() {
            insertMapping(userId, actionId, CompletionState.IN_PROGRESS);
            Long actionId2 = TestDataHelper.insertAction(jdbcTemplate);
            insertMapping(userId, actionId2, CompletionState.COMPLETED);

            List<UserActionHistory> result = historyDao.findUserActionHistory(userId, true);

            assertEquals(1, result.size());
            assertEquals(CompletionState.IN_PROGRESS.name(), result.getFirst().getCompletionState());
        }

        @Test
        @DisplayName("includes completed subtask ids for active actions")
        void includesCompletedSubtaskIdsForActiveActions() {
            insertMapping(userId, actionId, CompletionState.IN_PROGRESS);
            insertMapping(userId, actionId, CompletionState.COMPLETED, true, "10");
            insertMapping(userId, actionId, CompletionState.COMPLETED, true, "11");

            List<UserActionHistory> result = historyDao.findUserActionHistory(userId, true);

            assertEquals(1, result.size());
            assertEquals(List.of(10L, 11L), result.getFirst().getCompletedSubtaskIds());
        }

        @Test
        @DisplayName("does not return a completed action in active history")
        void doesNotReturnCompletedActionInActiveHistory() {
            insertMapping(userId, actionId, CompletionState.IN_PROGRESS);
            insertMapping(userId, actionId, CompletionState.COMPLETED, true, "10");
            insertMapping(userId, actionId, CompletionState.COMPLETED, true, "11");
            insertMapping(userId, actionId, CompletionState.COMPLETED);

            List<UserActionHistory> activeResult = historyDao.findUserActionHistory(userId, true);
            List<UserActionHistory> completedResult = historyDao.findUserActionHistory(userId, false);

            assertTrue(activeResult.isEmpty());
            assertEquals(1, completedResult.size());
            assertEquals(CompletionState.COMPLETED.name(), completedResult.getFirst().getCompletionState());
            assertEquals(List.of(10L, 11L), completedResult.getFirst().getCompletedSubtaskIds());
        }

        @Test
        @DisplayName("returns only COMPLETED when active is false")
        void returnsOnlyCompletedWhenActiveFalse() {
            insertMapping(userId, actionId, CompletionState.IN_PROGRESS);
            Long actionId2 = TestDataHelper.insertAction(jdbcTemplate);
            insertMapping(userId, actionId2, CompletionState.COMPLETED);

            List<UserActionHistory> result = historyDao.findUserActionHistory(userId, false);

            assertEquals(1, result.size());
            assertEquals(CompletionState.COMPLETED.name(), result.getFirst().getCompletionState());
        }

        @Test
        @DisplayName("returns empty list when user has no action history")
        void returnsEmptyForUserWithNoHistory() {
            List<UserActionHistory> result = historyDao.findUserActionHistory(userId, false);

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("results are ordered by created_on DESC")
        void resultsOrderedByCreatedOnDesc() {
            Long actionId2 = TestDataHelper.insertAction(jdbcTemplate);

            jdbcTemplate.update(
                    "INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask) VALUES (?,?,?,?,?)",
                    userId, actionId, CompletionState.COMPLETED.name(),
                    Timestamp.valueOf(LocalDateTime.now().minusHours(2)), false);
            jdbcTemplate.update(
                    "INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask) VALUES (?,?,?,?,?)",
                    userId, actionId2, CompletionState.COMPLETED.name(),
                    Timestamp.valueOf(LocalDateTime.now()), false);

            List<UserActionHistory> result = historyDao.findUserActionHistory(userId, false);

            assertEquals(2, result.size());
            // First result should be the most recent (COMPLETED)
            assertEquals(CompletionState.COMPLETED.name(), result.getFirst().getCompletionState());
        }
    }
}
