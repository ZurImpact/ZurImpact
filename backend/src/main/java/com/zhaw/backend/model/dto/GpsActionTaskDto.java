package com.zhaw.backend.model.dto;

import com.zhaw.backend.enums.DistanceThresholdLevel;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GpsActionTaskDto extends SubTaskDto {

    private Double latitude;
    private Double longitude;
    private DistanceThresholdLevel distanceThresholdLevel;
}
