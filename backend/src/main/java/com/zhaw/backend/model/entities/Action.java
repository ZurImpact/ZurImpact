package com.zhaw.backend.model.entities;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "action")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private String tags;

    @Column
    private String type;

    @Column(name = "has_subtasks")
    private Boolean hasSubtasks;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Column(name = "created_on", nullable = false, updatable = false)
    private LocalDateTime createdOn;


    @PrePersist
    protected void onCreate() {
        if (createdOn == null) {
            createdOn = LocalDateTime.now();
        }
    }
}
