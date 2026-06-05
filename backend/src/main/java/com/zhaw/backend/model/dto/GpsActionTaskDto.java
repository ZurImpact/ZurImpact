package com.zhaw.backend.model.dto;

import com.zhaw.backend.enums.DistanceThresholdLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class GpsActionTaskDto extends SubTaskDto {

    private Double latitude;
    private Double longitude;
    private DistanceThresholdLevel distanceThresholdLevel;
}
