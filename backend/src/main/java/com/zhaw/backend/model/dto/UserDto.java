package com.zhaw.backend.model.dto;

import com.zhaw.backend.enums.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private Long addressId;
    private Set<Role> roles;
    private LocalDateTime createdAt;
}
