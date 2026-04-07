package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.Voucher;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Data-access object for {@link Voucher} entities.
 * Uses native SQL via JdbcTemplate.
 */
@Repository
@RequiredArgsConstructor
public class VoucherDao {

    private final JdbcTemplate jdbc;

    // ── Row mapper ──────────────────────────────────────────────────────────────

    private static final RowMapper<Voucher> ROW_MAPPER = (rs, rowNum) -> {
        Voucher v = new Voucher();
        v.setId(rs.getLong("id"));
        v.setDescription(rs.getString("description"));
        v.setDisplayName(rs.getString("display_name"));
        v.setPoints(rs.getInt("points"));
        v.setCompanyId(rs.getLong("company_id"));
        v.setValidUntil(rs.getTimestamp("valid_until").toLocalDateTime());
        v.setCreatedOn(rs.getTimestamp("created_on").toLocalDateTime());
        return v;
    };

    // ── Queries ────────────────────────────────────────────────────────────────

    public Optional<Voucher> findById(Long id) {
        List<Voucher> results = jdbc.query(
                "SELECT id, description, display_name, points, company_id, valid_until, created_on FROM voucher WHERE id = ?",
                ROW_MAPPER,
                id);
        return results.stream().findFirst();
    }

    public List<Voucher> getAll() {
        return jdbc.query(
                "SELECT id, description, display_name, points, company_id, valid_until, created_on FROM voucher",
                ROW_MAPPER);
    }

    /**
     * Inserts or updates (basic upsert-style in Java).
     * Note: For insert we require company_id, but the entity holds a Company relation.
     */
    public Voucher save(Voucher voucher) {
        if (voucher.getId() == null) {
            return insert(voucher);
        }
        return update(voucher);
    }

    public void deleteById(Long id) {
        jdbc.update("DELETE FROM voucher WHERE id = ?", id);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private Voucher insert(Voucher voucher) {
        if (voucher.getCreatedOn() == null) {
            voucher.setCreatedOn(LocalDateTime.now());
        }
        Long companyId = voucher.getCompanyId();
        if (companyId == null) {
            throw new IllegalArgumentException("Voucher.company.id must be set for insert (company_id is NOT NULL)");
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO voucher (description, display_name, points, company_id, valid_until, created_on) "
                            + "VALUES (?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, voucher.getDescription());
            ps.setString(2, voucher.getDisplayName());
            ps.setInt(3, voucher.getPoints());
            ps.setLong(4, companyId);
            ps.setTimestamp(5, Timestamp.valueOf(voucher.getValidUntil()));
            ps.setTimestamp(6, Timestamp.valueOf(voucher.getCreatedOn()));
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            voucher.setId(keyHolder.getKey().longValue());
        }

        return voucher;
    }

    private Voucher update(Voucher voucher) {
        Long companyId = voucher.getCompanyId();
        if (companyId == null) {
            throw new IllegalArgumentException("Voucher.company.id must be set for update (company_id is NOT NULL)");
        }

        jdbc.update(
                "UPDATE voucher SET description = ?, display_name = ?, points = ?, company_id = ?, valid_until = ? WHERE id = ?",
                voucher.getDescription(),
                voucher.getDisplayName(),
                voucher.getPoints(),
                companyId,
                Timestamp.valueOf(voucher.getValidUntil()),
                voucher.getId());

        return voucher;
    }
}
