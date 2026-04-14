package com.zhaw.backend.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_voucher")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "voucher_id", nullable = false)
    private Long voucherId;

    @Column(name = "redemption_code", nullable = false, unique = true, length = 36)
    private String redemptionCode;

    @Column(name = "redeemed_at", nullable = false)
    private LocalDateTime redeemedAt;
}