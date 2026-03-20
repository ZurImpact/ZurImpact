package com.zhaw.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String description;
    private Long address;
    private LocalDateTime createdOn;
}
