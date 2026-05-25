package com.zhaw.backend.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA entity mapped to the "users" table.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "address_id")
    private Long address;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "role", nullable = false, length = 50)
    private String role;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified;

    @Column(name = "has_pending_email_change", nullable = false)
    private Boolean hasPendingEmailChange;

    /**
     * Sets createdAt in-memory before INSERT so the field is never null
     * immediately after em.persist() — without waiting for a DB round-trip.
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (emailVerified == null) {
            emailVerified = Boolean.FALSE;
        }
        if (hasPendingEmailChange == null) {
            hasPendingEmailChange = Boolean.FALSE;
        }
    }
}
