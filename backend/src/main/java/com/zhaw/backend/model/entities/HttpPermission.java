package com.zhaw.backend.model.entities;

import lombok.*;

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

