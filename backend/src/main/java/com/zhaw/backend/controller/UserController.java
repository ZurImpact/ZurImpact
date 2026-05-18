package com.zhaw.backend.controller;

import com.zhaw.backend.mappers.UserMapper;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.model.dto.auth.PasswordChangeRequest;
import com.zhaw.backend.service.auth.AuthService;
import com.zhaw.backend.security.CurrentUserResolver;
import com.zhaw.backend.service.UserActionHistoryService;
import com.zhaw.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for user information and self-service")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserActionHistoryService userActionHistoryService;
    private final AuthService authService;
    private final CurrentUserResolver currentUserResolver;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Returns a user by their ID. Restricted to the user themselves and admin.")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.userId")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long id) {
        return userService.findUserById(id)
                .map(UserMapper::toResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/actions")
    @Operation(summary = "Get user action history", description = "Returns the action history for a user, optionally filtered by completion state.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserActionHistoryDto>> getUserActions(
            @PathVariable("id") Long id,
            @RequestParam(name = "active", required = false, defaultValue = "false") Boolean active) {
        return getActionsForUser(id, active);
    }

    @GetMapping("/me/actions")
    @Operation(summary = "Get my action history", description = "Returns the action history for the authenticated user, optionally filtered by completion state.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserActionHistoryDto>> getMyActions(
            @RequestParam(name = "active", required = false, defaultValue = "false") Boolean active,
            Authentication authentication) {
        Long userId = currentUserResolver.userIdOf(authentication);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        return getActionsForUser(userId, active);
    }

    @PostMapping("/me/password-change")
    @Operation(summary = "Change password", description = "Changes the authenticated user's password and revokes all sessions including the current one — client must log in again afterwards.")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest request,
                                            Authentication authentication) {
        Long userId = currentUserResolver.userIdOf(authentication);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        AuthService.ChangePasswordResult result = authService.changePassword(
                userId, request.currentPassword(), request.newPassword());
        return switch (result) {
            case SUCCESS -> ResponseEntity.noContent().build();
            case WRONG_CURRENT -> ResponseEntity.badRequest().body(Map.of("message", "wrong_current_password"));
            case USER_NOT_FOUND -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        };
    }

    private ResponseEntity<List<UserActionHistoryDto>> getActionsForUser(Long userId, Boolean active) {
        try {
            return ResponseEntity.ok(userActionHistoryService.getUserActions(userId, active));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
