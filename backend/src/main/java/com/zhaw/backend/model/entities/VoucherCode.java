package com.zhaw.backend.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_code")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VoucherCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_id", nullable = false)
    private Long voucherId;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
}