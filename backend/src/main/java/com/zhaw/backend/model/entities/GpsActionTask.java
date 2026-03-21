package com.zhaw.backend.model.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gps_action_tasks")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GpsActionTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String description;

    @Column(name = "action_id", nullable = false)
    private Long actionId;

    @Column(name = "gps_x", nullable = false)
    private Float gpsX;

    @Column(name = "gps_y", nullable = false)
    private Float gpsY;

    @Column(name = "gps_z")
    private Float gpsZ;
}
