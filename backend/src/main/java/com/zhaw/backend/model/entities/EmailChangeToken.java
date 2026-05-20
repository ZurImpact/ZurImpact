package com.zhaw.backend.model.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailChangeToken {
    private String tokenHash;
    private Long userId;
    private String newEmail;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime consumedAt;
}
