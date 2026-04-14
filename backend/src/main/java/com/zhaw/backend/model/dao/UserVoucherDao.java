package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.UserVoucher;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;

/**
 * Data-access object for {@link UserVoucher} redemption records.
 * Insert-only — redemptions are never updated or deleted.
 */
@Repository
@RequiredArgsConstructor
public class UserVoucherDao {

    private final JdbcTemplate jdbc;

    public UserVoucher save(UserVoucher userVoucher) {
        if (userVoucher.getRedeemedAt() == null) {
            userVoucher.setRedeemedAt(LocalDateTime.now());
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO user_voucher (user_id, voucher_id, redemption_code, redeemed_at) "
                            + "VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userVoucher.getUserId());
            ps.setLong(2, userVoucher.getVoucherId());
            ps.setString(3, userVoucher.getRedemptionCode());
            ps.setTimestamp(4, Timestamp.valueOf(userVoucher.getRedeemedAt()));
            return ps;
        }, keyHolder);

        java.util.Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null && keys.containsKey("id")) {
            userVoucher.setId(((Number) keys.get("id")).longValue());
        } else if (keyHolder.getKey() != null) {
            userVoucher.setId(keyHolder.getKey().longValue());
        }

        return userVoucher;
    }
}