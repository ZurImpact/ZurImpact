package com.zhaw.backend.enums;

import lombok.Getter;

@Getter
public enum DistanceThresholdLevel {
    EASY(20.0),
    MEDIUM(12.5),
    HARD(5);

    private final double offsett;

    DistanceThresholdLevel(double offsett) {
        this.offsett = offsett;
    }
}
