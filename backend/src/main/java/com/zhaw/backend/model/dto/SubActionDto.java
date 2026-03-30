package com.zhaw.backend.model.dto;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public class SubActionDto {

    private Long id;
    private String description;
    private String displayName;
    private Long actionId;
    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;
}
