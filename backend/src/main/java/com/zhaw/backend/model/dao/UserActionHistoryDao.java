package com.zhaw.backend.model.dao;

import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.entities.UserActionHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.ArrayList;
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
            .mappingCreatedOn(toLocalDateTime(rs.getTimestamp("mapping_created_on")))
            .build();

    private static java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    /**
     * Finds all Actions a user did
     * @param userId User to search for
     * @return Actions which the user did
     */
    public List<UserActionHistory> findUserActionHistory(Long userId, Boolean active) {
        StringBuilder sql = new StringBuilder(
                "SELECT a.id AS action_id, a.description, a.display_name, a.points, a.tags, "
                        + "a.valid_until, a.created_on AS action_created_on, "
                        + "uam.completion_state, uam.is_subtask, uam.subtask_id, uam.created_on AS mapping_created_on "
                        + "FROM user_action_mapping uam "
                        + "JOIN action a ON a.id = uam.action_id "
                        + "WHERE uam.user_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (active) {
            sql.append(" AND uam.completion_state = 'IN_PROGRESS'");
        }else{
            sql.append(" AND uam.completion_state = 'COMPLETED'");
        }

        sql.append(" ORDER BY uam.created_on DESC");

        return jdbc.query(sql.toString(), HISTORY_ROW_MAPPER, params.toArray());
    }
}
