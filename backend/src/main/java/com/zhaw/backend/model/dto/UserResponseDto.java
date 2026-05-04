package com.zhaw.backend.model.dto;

import com.zhaw.backend.enums.Role;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private Long address;
    private String createdAt;
    private Integer points;
    private Role role;
}
