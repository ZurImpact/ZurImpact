package com.zhaw.backend.model.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gps_action_tasks")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GpsActionTask extends SubTask {

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "distance_threshold_level", nullable = false)
    private String distanceThresholdLevel;
}
