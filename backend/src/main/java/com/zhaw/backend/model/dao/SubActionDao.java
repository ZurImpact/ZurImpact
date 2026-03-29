package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.GpsActionTask;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

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
        return jdbc.query(
                "SELECT id, description, display_name, action_id, gps_x, gps_y, gps_z FROM gps_action_tasks WHERE action_id = ?",
                (rs, rowNum) -> {
                    GpsActionTask task = new GpsActionTask();
                    task.setId(rs.getLong("id"));
                    task.setDescription(rs.getString("description"));
                    task.setDisplayName(rs.getString("display_name"));
                    task.setActionId(rs.getLong("action_id"));
                    task.setGpsX(rs.getFloat("gps_x"));
                    task.setGpsY(rs.getFloat("gps_y"));
                    task.setGpsZ(rs.getFloat("gps_z"));
                    return task;
                },
                actionId
        );
    }
}
