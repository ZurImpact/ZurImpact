package com.zhaw.backend.model.dto;

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
public class UserActionHistoryDto {

    private Long actionId;
    private String description;
    private String displayName;
    private Integer points;
    private String tags;
    private LocalDateTime validUntil;
    private LocalDateTime actionCreatedOn;
    private String completionState;
    private Boolean isSubtask;
    private String subactionId;
    private LocalDateTime mappingCreatedOn;
}

