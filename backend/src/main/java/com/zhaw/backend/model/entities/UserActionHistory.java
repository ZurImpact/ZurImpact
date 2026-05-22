package com.zhaw.backend.model.entities;

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
public class UserActionHistory {

    private Long actionId;
    private String description;
    private String displayName;
    private Integer points;
    private String tags;
    private LocalDateTime validUntil;
    private LocalDateTime actionCreatedOn;
    private String completionState;
    private Boolean isSubtask;
    private String subtaskId;
    private List<Long> completedSubtaskIds;
    private LocalDateTime mappingCreatedOn;
}
