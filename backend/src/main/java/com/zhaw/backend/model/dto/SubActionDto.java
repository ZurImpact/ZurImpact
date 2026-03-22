package com.zhaw.backend.model.dto;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

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
    private Long   actionId;
}
