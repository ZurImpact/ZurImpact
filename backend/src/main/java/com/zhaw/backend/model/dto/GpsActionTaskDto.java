package com.zhaw.backend.model.dto;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GpsActionTaskDto extends SubActionDto{

    private Float gpsX;
    private Float gpsY;
    private Float gpsZ;

}
