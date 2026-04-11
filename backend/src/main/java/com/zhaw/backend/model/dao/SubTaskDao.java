package com.zhaw.backend.model.dao;

import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class SubTaskDao {

    private static final RowMapper<GpsActionTask> GPS_ROW_MAPPER = (rs, rowNum) -> {
        GpsActionTask task = new GpsActionTask();
        task.setId(rs.getLong("id"));
        task.setDescription(rs.getString("description"));
        task.setDisplayName(rs.getString("display_name"));
        task.setActionId(rs.getLong("action_id"));
        task.setLatitude(rs.getDouble("latitude"));
        task.setLongitude(rs.getDouble("longitude"));
        return task;
    };

    private final JdbcTemplate jdbc;

    public List<GpsActionTask> findGpsSubTask(Long actionId) {
        return jdbc.query(
                "SELECT id, description, display_name, action_id, latitude, longitude FROM gps_action_tasks WHERE action_id = ?",
                GPS_ROW_MAPPER,
                actionId
        );
    }

    public GpsActionTask findGpsSubTaskById(Long id) {
        return jdbc.queryForObject(
                "SELECT id, description, display_name, action_id, latitude, longitude FROM gps_action_tasks WHERE id = ?",
                GPS_ROW_MAPPER,
                id
        );
    }

    /**
     * Completes an action for a user by updating the corresponding record in the user_action_mapping table to COMPLETED state
     * @param userId id of the user for which the action should be completed
     * @param actionId id of the action which should be completed
     * @param isSubtask if it is a subtask
     * @param subTaskId subtask id
     * @return true if the action was successfully completed, false otherwise
     */
    public boolean completeSubTaskForUser(Long userId, Long actionId, Boolean isSubtask, String subTaskId) {
        int rows = jdbc.update("INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask, subtask_id) " +
                        "VALUES(?,?,?,?,?,?)",
                userId,actionId, CompletionState.COMPLETED.name(), Timestamp.valueOf(java.time.LocalDateTime.now()),
                isSubtask != null && isSubtask, subTaskId);
        return rows > 0;
    }

    /**
     * Returns a list of Subtasks and their coresponding CompletionState
     * @param userId id of the user
     * @param actionId id of the parent action
     * @return Map with subtask_id and completion_state for the given user and action
     */
    public Map<Long, CompletionState> findSubTaskCompletionStates(Long userId, Long actionId) {
        return jdbc.query(
                "SELECT subtask_id, completion_state FROM user_action_mapping " +
                        "WHERE user_id = ? AND action_id = ? AND is_subtask = true",
                rs -> {
                    Map<Long, CompletionState> result = new HashMap<>();
                    while (rs.next()) {
                        result.put(
                                rs.getLong("subtask_id"),
                                CompletionState.valueOf(rs.getString("completion_state"))
                        );
                    }
                    return result;
                },
                userId, actionId
        );
    }

    public void createGpsSubTask(Long actionId, GpsActionTaskDto dto) {
        jdbc.update(
                "INSERT INTO gps_action_tasks (description, display_name, action_id, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
                dto.getDescription(), dto.getDisplayName(), actionId, dto.getLatitude(), dto.getLongitude());
    }

    public boolean updateGpsSubTask(Long id, GpsActionTaskDto dto) {
        int rows = jdbc.update(
                "UPDATE gps_action_tasks SET description = ?, display_name = ?, latitude = ?, longitude = ? WHERE id = ?",
                dto.getDescription(), dto.getDisplayName(), dto.getLatitude(), dto.getLongitude(), id);
        return rows > 0;
    }

    public boolean deleteSubTask(Long id) {
        int rows = jdbc.update("DELETE FROM gps_action_tasks WHERE id = ?", id);
        return rows > 0;
    }
}
