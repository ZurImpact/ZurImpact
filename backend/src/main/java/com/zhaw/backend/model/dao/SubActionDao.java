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
}
