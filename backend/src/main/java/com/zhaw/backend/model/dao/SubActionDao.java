package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.GpsActionTask;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class SubActionDao {

    private final JdbcTemplate jdbc;

    public SubActionDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * RowMapper for mapping ResultSet to GpsActionTask entity with proper column handling
     */
    private static final RowMapper<GpsActionTask> GPS_ROW_MAPPER = (rs, rowNum) -> {
        GpsActionTask task = new GpsActionTask();
        task.setId(rs.getLong("id"));
        task.setDescription(rs.getString("description"));
        task.setDisplayName(rs.getString("display_name"));
        task.setActionId(rs.getLong("action_id"));
        task.setGpsX(rs.getFloat("gps_x"));
        task.setGpsY(rs.getFloat("gps_y"));
        
        if (rs.getObject("gps_z") != null) {
            task.setGpsZ(rs.getFloat("gps_z"));
        }
        
        Timestamp createdOn = rs.getTimestamp("created_on");
        if (createdOn != null) {
            task.setCreatedOn(createdOn.toLocalDateTime());
        }
        
        Timestamp updatedOn = rs.getTimestamp("updated_on");
        if (updatedOn != null) {
            task.setUpdatedOn(updatedOn.toLocalDateTime());
        }
        
        return task;
    };

    /**
     * Find all GPS sub-action IDs for a given action
     */
    public List<Long> findGpsSubActionIds(Long actionId) {
        return jdbc.queryForList(
                "SELECT id FROM gps_action_tasks WHERE action_id = ?",
                Long.class,
                actionId
        );
    }

    /**
     * Find all GPS sub-actions for a given action ID with proper column mapping
     */
    public List<GpsActionTask> findGpsSubAction(Long actionId) {
        return jdbc.query(
                "SELECT id, description, display_name, action_id, gps_x, gps_y, gps_z, created_on, updated_on " +
                "FROM gps_action_tasks " +
                "WHERE action_id = ?",
                GPS_ROW_MAPPER,
                actionId
        );
    }

    /**
     * Find a GPS action task by ID
     */
    public Optional<GpsActionTask> findById(Long id) {
        try {
            GpsActionTask task = jdbc.queryForObject(
                    "SELECT id, description, display_name, action_id, gps_x, gps_y, gps_z, created_on, updated_on " +
                    "FROM gps_action_tasks WHERE id = ?",
                    GPS_ROW_MAPPER,
                    id
            );
            return Optional.ofNullable(task);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Save a new GPS action task
     */
    public void save(GpsActionTask task) {
        jdbc.update(
                "INSERT INTO gps_action_tasks (display_name, description, action_id, gps_x, gps_y, gps_z, created_on, updated_on) " +
                "VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
                task.getDisplayName(),
                task.getDescription(),
                task.getActionId(),
                task.getGpsX(),
                task.getGpsY(),
                task.getGpsZ()
        );
    }

    /**
     * Update an existing GPS action task
     */
    public void update(GpsActionTask task) {
        jdbc.update(
                "UPDATE gps_action_tasks SET display_name = ?, description = ?, gps_x = ?, gps_y = ?, gps_z = ?, updated_on = NOW() " +
                "WHERE id = ?",
                task.getDisplayName(),
                task.getDescription(),
                task.getGpsX(),
                task.getGpsY(),
                task.getGpsZ(),
                task.getId()
        );
    }

    /**
     * Delete a GPS action task by ID
     */
    public void delete(Long id) {
        jdbc.update("DELETE FROM gps_action_tasks WHERE id = ?", id);
    }
}
