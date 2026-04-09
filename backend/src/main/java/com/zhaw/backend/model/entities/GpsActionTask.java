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

    @Column(name = "gps_x", nullable = false)
    private Float gpsX;

    @Column(name = "gps_y", nullable = false)
    private Float gpsY;
}
