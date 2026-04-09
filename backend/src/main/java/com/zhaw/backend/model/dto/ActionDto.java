package com.zhaw.backend.model.dto;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.enums.Tags;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActionDto {

    private Long id;
    private String description;
    private String displayName;
    private Integer points;
    private List<Tags> tags;
    private List<SubTaskDto> subTasks;
    private ActionType type;
    private Boolean hasSubtasks;
    private LocalDateTime validUntil;
    private LocalDateTime createdOn;
}
