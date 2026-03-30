package com.zhaw.backend.model.dao;

import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.entities.GpsActionTask;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class SubActionDao {

    private final JdbcTemplate jdbc;

    public SubActionDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Long> findGpsSubActionIds(Long actionId) {
        return jdbc.queryForList(
                "SELECT id FROM gps_action_tasks WHERE action_id = ?",
                Long.class,
                actionId
        );
    }

    public List<GpsActionTask> findGpsSubAction(Long actionId) {
        return jdbc.queryForList(
                "SELECT " +
                "id, description, display_name, action_id, gpsX, gpsY, gpsZ" +
                " FROM gps_action_tasks " +
                "WHERE action_id = ?",
                GpsActionTask.class,
                actionId
        );
    }

    public GpsActionTask findGpsSubActionById(Long id) {
        return jdbc.queryForObject(
                "SELECT " +
                "id, description, display_name, action_id, gpsX, gpsY, gpsZ" +
                " FROM gps_action_tasks " +
                "WHERE id = ?",
                GpsActionTask.class,
                id
        );
    }

    /**
     * Completes an action for a user by updating the corresponding record in the user_action_mapping table to COMPLETED state
     * @param userId id of the user for which the action should be completed
     * @param actionId id of the action which should be completed
     * @param isSubtask if it is a subtask
     * @param subActionId subtask id
     * @return true if the action was successfully completed, false otherwise
     */
    public boolean completeSubActionForUser(Long userId, Long actionId, Boolean isSubtask, String subActionId) {
        if(!isSubtask || subActionId == null) return false;
        int rows = jdbc.update("INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask, subaction_id) " +
                        "VALUES(?,?,?,?,?,?)",
                userId,actionId, CompletionState.COMPLETED.name(), Timestamp.valueOf(java.time.LocalDateTime.now()),
                isSubtask != null && isSubtask, subActionId);
        return rows > 0;
    }

    /**
     * Returns a list of Subtasks and their coresponding CompletionState
     * @param userId id of the user
     * @param actionId id of the parent action
     * @return List of maps with subaction_id and completion_state for the given user and action
     */
    public List<Map<String, CompletionState>> findSubActionCompletionStates(Long userId, Long actionId) {
        return jdbc.query(
                "SELECT subaction_id, completion_state FROM user_action_mapping " +
                "WHERE user_id = ? AND action_id = ? AND is_subtask = true",
                (rs, rowNum) -> {
                    Map<String, CompletionState> row = new HashMap<>();
                    row.put(
                            rs.getString("subaction_id"),
                            CompletionState.valueOf(rs.getString("completion_state"))
                    );
                    return row;
                },
                userId, actionId
        );
    }
}
