package com.zhaw.backend.model.entities;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthSession {
    private String tokenHash;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
