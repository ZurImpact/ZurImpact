package com.zhaw.backend.model.dao;

import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.dto.filters.ActionFilterDto;
import com.zhaw.backend.model.entities.Action;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Action entity.
 * Provides methods to query actions with dynamic filters.
 */

@Repository
public class ActionDao {

    private final JdbcTemplate jdbc;

    public ActionDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Helper method to map resultset to Action entity
     */
    private static final RowMapper<Action> ROW_MAPPER = (rs, rowNum) -> {
        Action action = new Action();
        action.setId(rs.getLong("id"));
        action.setDescription(rs.getString("description"));
        action.setDisplayName(rs.getString("display_name"));
        action.setPoints(rs.getInt("points"));
        action.setTags(rs.getString("tags"));
        action.setType(rs.getString("type"));
        action.setHasSubtasks(rs.getBoolean("has_subtasks"));
        action.setValidUntil(rs.getTimestamp("valid_until").toLocalDateTime());
        action.setCreatedOn(rs.getTimestamp("created_on").toLocalDateTime());
        return action;
    };

    /**
     * Helper method to map resultset to ActionHistoryDto, used for user action history query
     */
    private static final RowMapper<UserActionHistoryDto> HISTORY_ROW_MAPPER = (rs, rowNum) -> UserActionHistoryDto.builder()
            .actionId(rs.getLong("action_id"))
            .description(rs.getString("description"))
            .displayName(rs.getString("display_name"))
            .points(rs.getInt("points"))
            .tags(rs.getString("tags"))
            .validUntil(rs.getTimestamp("valid_until").toLocalDateTime())
            .actionCreatedOn(rs.getTimestamp("action_created_on").toLocalDateTime())
            .completionState(String.valueOf(CompletionState.valueOf(rs.getString("completion_state"))))
            .isSubtask(rs.getBoolean("is_subtask"))
            .subactionId(rs.getString("subaction_id"))
            .mappingCreatedOn(rs.getTimestamp("mapping_created_on").toLocalDateTime())
            .build();

    /**
     * Finds all actions in regard to filter
     * @param filter ActionFilterDto with all filter options, if null, no filter is applied and all actions are returned
     * @return List of result
     */
    public List<Action> findAllFiltered(ActionFilterDto filter) {
        StringBuilder sql = new StringBuilder(
                "SELECT id, description, display_name, points, tags, type, has_subtasks, valid_until, created_on FROM action");
        List<Object> params = new ArrayList<>();
        boolean hasWhere = false;

        if (filter != null) {
            hasWhere = appendTextFilter(sql, params, hasWhere, filter.getText());
            hasWhere = appendEquals(sql, params, hasWhere, "points", filter.getPoints());
            hasWhere = appendTagFilter(sql, params, hasWhere, filter.getTags());
            appendTimestamp(sql, params, hasWhere, "valid_until", filter.getValidUntil());
        }

        return jdbc.query(sql.toString(), ROW_MAPPER, params.toArray());
    }

    public Action findById(Long id){
        List<Action> actions = jdbc.query(
                "SELECT id, description, display_name, points, tags, type, has_subtasks, valid_until, created_on FROM action WHERE id = ?",
                ROW_MAPPER,
                id);
        return actions.isEmpty() ? null : actions.get(0);
    }

    //TODO: DISCUSS IF DAO IS ALLOWED TO WORK WITH DTOS, IF NOT, THIS METHOD SHOULD BE MOVED TO SERVICE LAYER

    /**
     * Finds all Actions a user did
     * @param userId User to search for
     * @return Actions which the user did
     */
    public List<UserActionHistoryDto> findUserActionHistory(Long userId, Boolean active) {
        StringBuilder sql = new StringBuilder(
                "SELECT a.id AS action_id, a.description, a.display_name, a.points, a.tags, "
                        + "a.valid_until, a.created_on AS action_created_on, "
                        + "uam.completion_state, uam.is_subtask, uam.subaction_id, uam.created_on AS mapping_created_on "
                        + "FROM user_action_mapping uam "
                        + "JOIN action a ON a.id = uam.action_id "
                        + "WHERE uam.user_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (active != null) {
            sql.append(" AND uam.completion_state = ?");
            params.add(active ? CompletionState.IN_PROGRESS.name() : CompletionState.COMPLETED.name());
        }

        sql.append(" ORDER BY uam.created_on DESC");

        return jdbc.query(sql.toString(), HISTORY_ROW_MAPPER, params.toArray());
    }

    /**
     * @param userId id of the user for which the action should be started
     * @param actionId id of the action which should be started
     * @param isSubtask if the action is a subtask
     * @param subactionId id of the subtask
     * @return true if the action was successfully started, false otherwise
     */
    public boolean startAction(Long userId, Long actionId, Boolean isSubtask, String subactionId) {
        int rows = jdbc.update("INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask, subaction_id) " +
                                "VALUES (?, ?, ?, ?, ?, ?)",
                userId, actionId, CompletionState.IN_PROGRESS.name(), Timestamp.valueOf(java.time.LocalDateTime.now()),
                isSubtask != null && isSubtask, subactionId);
        return rows > 0;
    }

    /**
     * Completes an action for a user by updating the corresponding record in the user_action_mapping table to COMPLETED state
     * @param userId id of the user for which the action should be completed
     * @param actionId id of the action which should be completed
     * @param isSubtask if it is a subtask
     * @param subactionId subtask id
     * @return true if the action was successfully completed, false otherwise
     */
    public boolean completeAction(Long userId, Long actionId, Boolean isSubtask, String subactionId) {
        int rows = jdbc.update("INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask, subaction_id) " +
                                "VALUES(?,?,?,?,?,?)",
                userId,actionId,CompletionState.COMPLETED.name(),Timestamp.valueOf(java.time.LocalDateTime.now()),
                isSubtask != null && isSubtask, subactionId);
        return rows > 0;
    }

    /**
     * Deletes the action mapping for a user, effectively deleting the action for that user
     * @param userId id of the user for which the action should be deleted
     * @param actionId id of the action which should be deleted
     * @return true if the action was successfully deleted, false otherwise
     */
    public boolean deleteAction(Long userId, Long actionId) {
        int rows = jdbc.update("DELETE FROM user_action_mapping WHERE user_id = ? AND action_id = ?",
                ps -> {
                    ps.setLong(1, userId);
                    ps.setLong(2, actionId);
                });
        return rows > 0;
    }

    /**
     * Checks if an action has been completed by a user
     * @param userId id of the user
     * @param actionId id of the action
     * @param isSubtask whether this is a subtask check
     * @param subactionId subtask id (can be null if not a subtask)
     * @return true if the action is completed, false otherwise
     */
    public boolean isActionCompleted(Long userId, Long actionId, Boolean isSubtask, Long subactionId) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) FROM user_action_mapping " +
                "WHERE user_id = ? AND action_id = ? AND completion_state = ?");
        List<Object> params = new ArrayList<>();
        params.add(userId);
        params.add(actionId);
        params.add(CompletionState.COMPLETED.name());

        //TODO: cleanup
        if (isSubtask != null) {
            sql.append(" AND is_subtask = ?");
            params.add(isSubtask);
            if (subactionId != null) {
                sql.append(" AND subaction_id = ?");
                params.add(subactionId);
            }
        }

        Integer count = jdbc.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null && count > 0;
    }

    /**
     * Adds a text filter to the query, which searches for the text in description and display_name, case-insensitive
     * @param sql query builder to append the filter to
     * @param params list of parameters to add the filter values to
     * @param hasWhere indicates if the query already has a WHERE clause, to decide if AND or WHERE should be used
     * @param text filter text
     * @return is where has been used
     */
    private boolean appendTextFilter(StringBuilder sql, List<Object> params, boolean hasWhere, String text) {
        if (text == null || text.trim().isEmpty()) {
            return hasWhere;
        }
        String value = "%" + text.trim().toLowerCase() + "%";
        sql.append(hasWhere ? " AND (" : " WHERE (")
                .append("LOWER(description) LIKE ? OR LOWER(display_name) LIKE ?")
                .append(")");
        params.add(value);
        params.add(value);
        return true;
    }

    /**
     * Adds equals condition
     * @param sql query
     * @param params list of filter to add
     * @param hasWhere indicates if the query already has a WHERE clause, to decide if AND or WHERE should be used
     * @param column column that needs to be equaled
     * @param value value to compare
     * @return if where has been used
     */
    private boolean appendEquals(StringBuilder sql, List<Object> params, boolean hasWhere, String column, Object value) {
        if (value == null) {
            return hasWhere;
        }
        sql.append(hasWhere ? " AND " : " WHERE ").append(column).append(" = ?");
        params.add(value);
        return true;
    }

    private boolean appendTimestamp(StringBuilder sql, List<Object> params, boolean hasWhere, String column, java.time.LocalDateTime value) {
        if (value == null) {
            return hasWhere;
        }
        sql.append(hasWhere ? " AND " : " WHERE ").append(column).append(" = ?");
        params.add(Timestamp.valueOf(value));
        return true;
    }

    /**
     * Filter for tags
     * @param sql query
     * @param params tags to be added in the condition
     * @param hasWhere indicates if the query already has a WHERE clause, to decide if AND or WHERE should be used
     * @param tags tages to be filtered by
     * @return if where has been used
     */
    private boolean appendTagFilter(StringBuilder sql, List<Object> params, boolean hasWhere, List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return hasWhere;
        }

        List<String> normalized = tags.stream()
                .filter(tag -> tag != null && !tag.trim().isEmpty())
                .map(tag -> tag.trim().toLowerCase())
                .toList();

        if (normalized.isEmpty()) {
            return hasWhere;
        }

        sql.append(hasWhere ? " AND (" : " WHERE (");
        for (int i = 0; i < normalized.size(); i++) {
            if (i > 0) {
                sql.append(" OR ");
            }
            sql.append("LOWER(tags) LIKE ?");
            params.add("%" + normalized.get(i) + "%");
        }
        sql.append(")");
        return true;
    }
}
