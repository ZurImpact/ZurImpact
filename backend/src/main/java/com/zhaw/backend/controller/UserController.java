package com.zhaw.backend.controller;

import com.zhaw.backend.mappers.UserMapper;
import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for user information")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Returns a user by their ID. Open to all users.")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long id) {
        return userService.findUserById(id)
                .map(UserMapper::toResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
