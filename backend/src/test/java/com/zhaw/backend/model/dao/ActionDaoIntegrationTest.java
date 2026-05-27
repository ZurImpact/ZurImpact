package com.zhaw.backend.model.dao;

import com.zhaw.backend.config.DockerAvailableCondition;
import com.zhaw.backend.config.TestDatabaseConfig;
import com.zhaw.backend.config.TestDataHelper;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.mappers.ActionFilterMapper;
import com.zhaw.backend.model.dto.filters.ActionFilterDto;
import com.zhaw.backend.model.entities.Action;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@Transactional
@DisplayName("ActionDao – Integration Tests (Testcontainers PostgreSQL)")
class ActionDaoIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ActionDao actionDao;
    private Long userId;

    @BeforeEach
    void setUp() {
        actionDao = new ActionDao(jdbcTemplate);
        Long addressId = TestDataHelper.insertAddress(jdbcTemplate);
        userId = TestDataHelper.insertUser(jdbcTemplate, addressId);
    }

    // ── Helper ──────────────────────────────────────────────────────────

    private Action buildAction(String displayName, String tags, int points, String type) {
        Action a = new Action();
        a.setDescription("Description of " + displayName);
        a.setDisplayName(displayName);
        a.setPoints(points);
        a.setTags(tags);
        a.setType(type);
        a.setHasSubtasks(false);
        a.setValidUntil(LocalDateTime.now().plusDays(30));
        return a;
    }

    // ── findAllFiltered ─────────────────────────────────────────────────

    @Nested
    @DisplayName("findAllFiltered")
    class FindAllFiltered {

        @Test
        @DisplayName("returns all actions when filter is null")
        void returnsAllWhenFilterNull() {
            Long id1 = actionDao.createAction(buildAction("Alpha", "FOOD", 10, "GPS"));
            Long id2 = actionDao.createAction(buildAction("Beta", "SPORTS", 20, "GPS"));

            List<Action> result = actionDao.findAllFiltered(null);

            assertTrue(result.stream().anyMatch(a -> a.getId().equals(id1)));
            assertTrue(result.stream().anyMatch(a -> a.getId().equals(id2)));
        }

        @Test
        @DisplayName("filters out expired actions even when no filter options provided")
        void filtersExpiredActionsWithoutExplicitFilter() {
            // Create an action that expired in the past
            Action expiredAction = buildAction("Expired Action", "FOOD", 10, "GPS");
            expiredAction.setValidUntil(LocalDateTime.now().minusDays(5)); // 5 days ago
            Long expiredId = actionDao.createAction(expiredAction);

            // Create a valid action (future expiry)
            Action validAction = buildAction("Valid Action", "FOOD", 10, "GPS");
            validAction.setValidUntil(LocalDateTime.now().plusDays(30)); // 30 days from now
            Long validId = actionDao.createAction(validAction);

            ActionFilterDto dto = ActionFilterMapper.fromRequest(null, null, null, null);

            List<Action> result = actionDao.findAllFiltered(dto);

            // The result should NOT contain the expired action
            assertTrue(result.stream().anyMatch(a -> a.getId().equals(validId)),
                "Valid action should be present");
            assertFalse(result.stream().anyMatch(a -> a.getId().equals(expiredId)),
                "Expired action should be filtered out");
        }

        @Test
        @DisplayName("text filter matches description and displayName case-insensitively")
        void textFilterMatchesBothFields() {
            actionDao.createAction(buildAction("Biking Tour", "SPORTS", 10, "GPS"));
            actionDao.createAction(buildAction("Museum Visit", "ENTERTAINMENT", 5, "TICKET"));

            ActionFilterDto filter = new ActionFilterDto();
            filter.setText("biking");

            List<Action> result = actionDao.findAllFiltered(filter);

            assertEquals(1, result.size());
            assertEquals("Biking Tour", result.getFirst().getDisplayName());
        }

        @Test
        @DisplayName("points filter returns only exact matches")
        void pointsFilterExactMatch() {
            actionDao.createAction(buildAction("Cheap", "FOOD", 5, "GPS"));
            actionDao.createAction(buildAction("Expensive", "FOOD", 100, "GPS"));

            ActionFilterDto filter = new ActionFilterDto();
            filter.setPoints(5);

            List<Action> result = actionDao.findAllFiltered(filter);

            assertTrue(result.stream().allMatch(a -> a.getPoints() == 5));
            assertTrue(result.stream().anyMatch(a -> "Cheap".equals(a.getDisplayName())));
        }

        @Test
        @DisplayName("tags filter returns actions with matching tag")
        void tagsFilterMatchesSingle() {
            actionDao.createAction(buildAction("Food Action", "FOOD", 10, "GPS"));
            actionDao.createAction(buildAction("Sports Action", "SPORTS", 10, "GPS"));

            ActionFilterDto filter = new ActionFilterDto();
            filter.setTags(List.of("food"));

            List<Action> result = actionDao.findAllFiltered(filter);

            assertTrue(result.stream().anyMatch(a -> "Food Action".equals(a.getDisplayName())));
            assertTrue(result.stream().noneMatch(a -> "Sports Action".equals(a.getDisplayName())));
        }

        @Test
        @DisplayName("validUntil filter returns only exact timestamp matches")
        void validUntilFilterExactMatch() {
            LocalDateTime target = LocalDateTime.of(2030, 6, 15, 0, 0);
            Action a = buildAction("Timed Action", "FOOD", 10, "GPS");
            a.setValidUntil(target);
            actionDao.createAction(a);

            actionDao.createAction(buildAction("Other Action", "FOOD", 10, "GPS"));

            ActionFilterDto filter = new ActionFilterDto();
            filter.setValidUntil(target);

            List<Action> result = actionDao.findAllFiltered(filter);

            assertTrue(result.stream().anyMatch(a2 -> "Timed Action".equals(a2.getDisplayName())));
        }

        @Test
        @DisplayName("combined text and points filter narrows results correctly")
        void combinedFilters() {
            actionDao.createAction(buildAction("Hike Easy", "SPORTS", 5, "GPS"));
            actionDao.createAction(buildAction("Hike Hard", "SPORTS", 100, "GPS"));
            actionDao.createAction(buildAction("Swim Easy", "SPORTS", 5, "GPS"));

            ActionFilterDto filter = new ActionFilterDto();
            filter.setText("hike");
            filter.setPoints(5);

            List<Action> result = actionDao.findAllFiltered(filter);

            assertEquals(1, result.size());
            assertEquals("Hike Easy", result.getFirst().getDisplayName());
        }
    }

    // ── findById ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("returns action when it exists")
        void returnsActionWhenExists() {
            Long id = actionDao.createAction(buildAction("MyAction", "FOOD", 15, "GPS"));

            Action found = actionDao.findById(id);

            assertNotNull(found);
            assertEquals(id, found.getId());
            assertEquals("MyAction", found.getDisplayName());
            assertEquals(15, found.getPoints());
        }

        @Test
        @DisplayName("returns null for non-existent ID")
        void returnsNullForUnknownId() {
            assertNull(actionDao.findById(999999L));
        }
    }

    // ── createAction ────────────────────────────────────────────────────

    @Nested
    @DisplayName("createAction")
    class CreateAction {

        @Test
        @DisplayName("assigns generated ID and persists all fields")
        void assignsIdAndPersists() {
            Action action = buildAction("New Action", "TRAVEL", 50, "TICKET");
            action.setHasSubtasks(true);

            Long id = actionDao.createAction(action);

            assertNotNull(id);
            assertTrue(id > 0);

            Action found = actionDao.findById(id);
            assertNotNull(found);
            assertEquals("New Action", found.getDisplayName());
            assertEquals(50, found.getPoints());
            assertTrue(found.getHasSubtasks());
        }
    }

    // ── updateAction ────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateAction")
    class UpdateAction {

        @Test
        @DisplayName("returns true and persists changes for existing action")
        void returnsTrueAndPersistsChanges() {
            Long id = actionDao.createAction(buildAction("Original", "FOOD", 10, "GPS"));

            Action updated = buildAction("Updated", "SPORTS", 99, "TICKET");
            updated.setId(id);

            boolean result = actionDao.updateAction(updated);

            assertTrue(result);
            Action found = actionDao.findById(id);
            assertEquals("Updated", found.getDisplayName());
            assertEquals(99, found.getPoints());
        }

        @Test
        @DisplayName("returns false for non-existent action")
        void returnsFalseForNonExistent() {
            Action ghost = buildAction("Ghost", "FOOD", 1, "GPS");
            ghost.setId(999999L);

            assertFalse(actionDao.updateAction(ghost));
        }
    }

    // ── deleteActionById ────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteActionById")
    class DeleteActionById {

        @Test
        @DisplayName("returns true and removes action")
        void returnsTrueAndRemoves() {
            Long id = actionDao.createAction(buildAction("ToDelete", "FOOD", 10, "GPS"));

            assertTrue(actionDao.deleteActionById(id));
            assertNull(actionDao.findById(id));
        }

        @Test
        @DisplayName("returns false for non-existent ID")
        void returnsFalseForNonExistent() {
            assertFalse(actionDao.deleteActionById(999999L));
        }
    }

    // ── startAction / completeAction / deleteAction (user mapping) ───────

    @Nested
    @DisplayName("user action mapping")
    class UserActionMapping {

        @Test
        @DisplayName("startAction inserts IN_PROGRESS mapping")
        void startActionInsertsMapping() {
            Long actionId = TestDataHelper.insertAction(jdbcTemplate);

            boolean result = actionDao.startAction(userId, actionId, false, null);

            assertTrue(result);
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM user_action_mapping WHERE user_id=? AND action_id=? AND completion_state=?",
                    Integer.class, userId, actionId, CompletionState.IN_PROGRESS.name());
            assertEquals(1, count);
        }

        @Test
        @DisplayName("completeAction inserts COMPLETED mapping")
        void completeActionInsertsMapping() {
            Long actionId = TestDataHelper.insertAction(jdbcTemplate);

            boolean result = actionDao.completeAction(userId, actionId, false, null);

            assertTrue(result);
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM user_action_mapping WHERE user_id=? AND action_id=? AND completion_state=?",
                    Integer.class, userId, actionId, CompletionState.COMPLETED.name());
            assertEquals(1, count);
        }

        @Test
        @DisplayName("deleteAction removes the user mapping")
        void deleteActionRemovesMapping() {
            Long actionId = TestDataHelper.insertAction(jdbcTemplate);
            actionDao.startAction(userId, actionId, false, null);

            boolean result = actionDao.deleteAction(userId, actionId);

            assertTrue(result);
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM user_action_mapping WHERE user_id=? AND action_id=?",
                    Integer.class, userId, actionId);
            assertEquals(0, count);
        }

        @Test
        @DisplayName("deleteAction returns false when no mapping exists")
        void deleteActionReturnsFalseWhenNoMapping() {
            Long actionId = TestDataHelper.insertAction(jdbcTemplate);

            assertFalse(actionDao.deleteAction(userId, actionId));
        }
    }

    // ── isActionCompleted ────────────────────────────────────────────────

    @Nested
    @DisplayName("isActionCompleted")
    class IsActionCompleted {

        @Test
        @DisplayName("returns true when COMPLETED mapping exists")
        void returnsTrueForCompleted() {
            Long actionId = TestDataHelper.insertAction(jdbcTemplate);
            actionDao.completeAction(userId, actionId, false, null);

            assertTrue(actionDao.isActionCompleted(userId, actionId));
        }

        @Test
        @DisplayName("returns false when only IN_PROGRESS mapping exists")
        void returnsFalseForInProgress() {
            Long actionId = TestDataHelper.insertAction(jdbcTemplate);
            actionDao.startAction(userId, actionId, false, null);

            assertFalse(actionDao.isActionCompleted(userId, actionId));
        }

        @Test
        @DisplayName("returns false when no mapping exists")
        void returnsFalseWhenNoMapping() {
            Long actionId = TestDataHelper.insertAction(jdbcTemplate);

            assertFalse(actionDao.isActionCompleted(userId, actionId));
        }
    }

    // ── getPointsForAction ───────────────────────────────────────────────

    @Nested
    @DisplayName("getPointsForAction")
    class GetPointsForAction {

        @Test
        @DisplayName("returns correct points for existing action")
        void returnsCorrectPoints() {
            Action action = buildAction("Points Action", "FOOD", 42, "GPS");
            Long id = actionDao.createAction(action);

            assertEquals(42, actionDao.getPointsForAction(id));
        }
    }
}
