package com.zhaw.backend.model.dto.filters;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActionFilterDto {

    private String text;
    private Integer points;
    private List<String> tags;
    private LocalDateTime validUntil;
}
