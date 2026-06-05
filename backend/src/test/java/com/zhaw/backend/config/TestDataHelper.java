package com.zhaw.backend.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Utility for inserting prerequisite rows in DAO integration tests.
 * All inserts respect foreign-key constraints defined in the Flyway migrations.
 */
public final class TestDataHelper {

    private TestDataHelper() {
    }

    /**
     * Inserts a minimal address row and returns its generated ID.
     */
    public static Long insertAddress(JdbcTemplate jdbc) {
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO address (street, city, state, postal_code, country) VALUES (?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, "Test St " + UUID.randomUUID());
            ps.setString(2, "Testcity");
            ps.setString(3, "TS");
            ps.setString(4, "0000");
            ps.setString(5, "Testland");
            return ps;
        }, kh);
        return extractId(kh);
    }

    /**
     * Inserts a minimal company row (requires an existing address) and returns its generated ID.
     */
    public static Long insertCompany(JdbcTemplate jdbc, Long addressId) {
        String uid = UUID.randomUUID().toString().substring(0, 8);
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO company (name, email, phone_number, description, address_id) VALUES (?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, "Company-" + uid);
            ps.setString(2, uid + "@test.com");
            ps.setString(3, "+41" + uid);
            ps.setString(4, "Test company");
            ps.setLong(5, addressId);
            return ps;
        }, kh);
        return extractId(kh);
    }

    /**
     * Inserts a minimal action row and returns its generated ID.
     */
    public static Long insertAction(JdbcTemplate jdbc) {
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO action (description, display_name, points, tags, type, has_subtasks, valid_until, created_on) "
                            + "VALUES (?,?,?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, "Test description");
            ps.setString(2, "Test Action");
            ps.setInt(3, 10);
            ps.setString(4, "FOOD");
            ps.setString(5, "GPS");
            ps.setBoolean(6, false);
            ps.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now().plusDays(30)));
            ps.setTimestamp(8, Timestamp.valueOf(LocalDateTime.now()));
            return ps;
        }, kh);
        return extractId(kh);
    }

    /**
     * Inserts a minimal user row (requires an existing address) and returns its generated ID.
     */
    public static Long insertUser(JdbcTemplate jdbc, Long addressId) {
        String uid = UUID.randomUUID().toString().substring(0, 8);
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO users (username, email, address_id, password_hash, created_at, points) "
                            + "VALUES (?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, "user_" + uid);
            ps.setString(2, uid + "@test.com");
            ps.setLong(3, addressId);
            ps.setString(4, "hash_" + uid);
            ps.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
            ps.setInt(6, 0);
            return ps;
        }, kh);
        return extractId(kh);
    }

    private static Long extractId(KeyHolder kh) {
        Map<String, Object> keys = kh.getKeys();
        if (keys != null && keys.containsKey("id")) {
            return ((Number) keys.get("id")).longValue();
        }
        return kh.getKey().longValue();
    }
}
