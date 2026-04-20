package com.zhaw.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserVoucherDto {

    private String code;
    private Long voucherId;
    private String displayName;
    private Integer pointsDeducted;
    private LocalDateTime assignedAt;
}