package com.zhaw.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VoucherDto {

    private Long id;
    private String description;
    private String displayName;
    private Integer points;
    private CompanyDto companyDto;
    private Long companyId;
    private LocalDateTime validUntil;
    private LocalDateTime createdOn;
}
