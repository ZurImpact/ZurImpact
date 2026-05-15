package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.HttpPermission;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class HttpPermissionDao {

    private final JdbcTemplate jdbc;

    private static final RowMapper<HttpPermission> ROW_MAPPER = (rs, rowNum) -> HttpPermission.builder()
            .id(rs.getLong("id"))
            .pathPattern(rs.getString("path_pattern"))
            .httpMethod(rs.getString("http_method"))
            .roles(rs.getString("roles"))
            .build();

    public List<HttpPermission> findAll() {
        return jdbc.query("SELECT * FROM http_permission", ROW_MAPPER);
    }
}

