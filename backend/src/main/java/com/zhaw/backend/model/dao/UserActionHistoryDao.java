package com.zhaw.backend.model.dao;

import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.entities.UserActionHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserActionHistoryDao {

    private final JdbcTemplate jdbc;

    /**
     * Helper method to map resultset to ActionHistoryDto, used for user action history query
     */
    private static final RowMapper<UserActionHistory> HISTORY_ROW_MAPPER = (rs, rowNum) -> UserActionHistory.builder()
            .actionId(rs.getLong("action_id"))
            .description(rs.getString("description"))
            .displayName(rs.getString("display_name"))
            .points(rs.getInt("points"))
            .tags(rs.getString("tags"))
            .validUntil(toLocalDateTime(rs.getTimestamp("valid_until")))
            .actionCreatedOn(toLocalDateTime(rs.getTimestamp("action_created_on")))
            .completionState(String.valueOf(CompletionState.valueOf(rs.getString("completion_state"))))
            .isSubtask(rs.getBoolean("is_subtask"))
            .subtaskId(rs.getString("subtask_id"))
            .completedSubtaskIds(parseCompletedSubtaskIds(rs.getString("completed_subtask_ids")))
            .mappingCreatedOn(toLocalDateTime(rs.getTimestamp("mapping_created_on")))
            .build();

    private static java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private static List<Long> parseCompletedSubtaskIds(String completedSubtaskIds) {
        if (completedSubtaskIds == null || completedSubtaskIds.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(completedSubtaskIds.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(UserActionHistoryDao::tryParseLong)
                .filter(value -> value != null)
                .toList();
    }

    private static Long tryParseLong(String value) {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /**
     * Finds all Actions a user did
     *
     * @param userId User to search for
     * @return Actions which the user did
     */
    public List<UserActionHistory> findUserActionHistory(Long userId, Boolean active) {
        StringBuilder sql = new StringBuilder(
                "WITH latest_parent_mapping AS ( "
                        + "SELECT uam.*, ROW_NUMBER() OVER (PARTITION BY uam.user_id, uam.action_id ORDER BY uam.created_on DESC, uam.id DESC) AS rn "
                        + "FROM user_action_mapping uam "
                        + "WHERE uam.user_id = ? AND uam.is_subtask = false ) "
                        + "SELECT a.id AS action_id, a.description, a.display_name, a.points, a.tags, "
                        + "a.valid_until, a.created_on AS action_created_on, "
                        + "latest_parent_mapping.completion_state, latest_parent_mapping.is_subtask, latest_parent_mapping.subtask_id, latest_parent_mapping.created_on AS mapping_created_on, "
                        + "COALESCE((SELECT STRING_AGG(sub_uam.subtask_id, ',' ORDER BY sub_uam.created_on) "
                        + "FROM user_action_mapping sub_uam "
                        + "WHERE sub_uam.user_id = latest_parent_mapping.user_id AND sub_uam.action_id = latest_parent_mapping.action_id "
                        + "AND sub_uam.is_subtask = true AND sub_uam.completion_state = 'COMPLETED'), '') AS completed_subtask_ids "
                        + "FROM latest_parent_mapping "
                        + "JOIN action a ON a.id = latest_parent_mapping.action_id "
                        + "WHERE latest_parent_mapping.rn = 1");
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (Boolean.TRUE.equals(active)) {
            sql.append(" AND latest_parent_mapping.completion_state = 'IN_PROGRESS'");
        } else {
            sql.append(" AND latest_parent_mapping.completion_state = 'COMPLETED'");
        }

        sql.append(" ORDER BY latest_parent_mapping.created_on DESC");

        return jdbc.query(sql.toString(), HISTORY_ROW_MAPPER, params.toArray());
    }
}
