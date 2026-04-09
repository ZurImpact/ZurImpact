package com.zhaw.backend.model.dto;

import com.zhaw.backend.enums.ActionType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubTaskCompletionRequestDto {
    @NotNull
    private Long userId;

    @NotNull
    private Long actionId;

    @NotNull
    private Long subTaskId;

    @NotNull
    private ActionType actionType;

    private Map<String, Object> additionalData;
}
