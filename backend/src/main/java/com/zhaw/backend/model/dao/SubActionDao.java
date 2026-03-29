package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.dto.GpsActionTaskDto;
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

    public void createGpsSubAction(Long actionId, GpsActionTaskDto dto) {
        jdbc.update(
                "INSERT INTO gps_action_tasks (description, display_name, action_id, gps_x, gps_y, gps_z) VALUES (?, ?, ?, ?, ?, ?)",
                dto.getDescription(), dto.getDisplayName(), actionId, dto.getGpsX(), dto.getGpsY(), dto.getGpsZ());
    }

    public boolean updateGpsSubAction(Long id, GpsActionTaskDto dto) {
        int rows = jdbc.update(
                "UPDATE gps_action_tasks SET description = ?, display_name = ?, gps_x = ?, gps_y = ?, gps_z = ? WHERE id = ?",
                dto.getDescription(), dto.getDisplayName(), dto.getGpsX(), dto.getGpsY(), dto.getGpsZ(), id);
        return rows > 0;
    }

    public boolean deleteSubAction(Long id) {
        int rows = jdbc.update("DELETE FROM gps_action_tasks WHERE id = ?", id);
        return rows > 0;
    }
}
