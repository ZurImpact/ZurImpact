package com.zhaw.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

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
    private String validUntil;
    private String actionCreatedOn;
    private String completionState;
    private Boolean isSubtask;
    private String subtaskId;
    private List<Long> completedSubtaskIds;
    private String mappingCreatedOn;
}

