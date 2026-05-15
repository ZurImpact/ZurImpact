package com.zhaw.backend.model.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HttpPermission {
    private Long id;
    private String pathPattern;
    private String httpMethod;
    private String roles;
}

