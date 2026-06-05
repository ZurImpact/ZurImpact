package com.zhaw.backend.controller;

import com.zhaw.backend.exception.BadRequestException;
import com.zhaw.backend.exception.ConflictException;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.exception.UnauthorizedException;
import com.zhaw.backend.mappers.UserMapper;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.model.dto.auth.ChangeEmailRequest;
import com.zhaw.backend.model.dto.auth.ChangeUsernameRequest;
import com.zhaw.backend.model.dto.auth.PasswordChangeRequest;
import com.zhaw.backend.security.CurrentUserResolver;
import com.zhaw.backend.service.UserActionHistoryService;
import com.zhaw.backend.service.UserService;
import com.zhaw.backend.service.auth.AuthService;
import com.zhaw.backend.service.auth.EmailChangeTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    private final EmailChangeTokenService emailChangeTokenService;
    private final CurrentUserResolver currentUserResolver;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Returns a user by their ID. Restricted to the user themselves and admin.")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.userId")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long id) {
        return userService.findUserById(id)
                .map(user -> {
                    boolean hasPending = emailChangeTokenService.hasPendingEmailToken(user.getId());
                    return UserMapper.toResponseDto(user, hasPending);
                })
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("User with id " + id + " not found"));
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
            throw new UnauthorizedException("Not authenticated");
        }
        return getActionsForUser(userId, active);
    }

    @PostMapping("/me/password-change")
    @Operation(summary = "Change password", description = "Changes the authenticated user's password and revokes all sessions including the current one — client must log in again afterwards.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request,
                                               Authentication authentication) {
        Long userId = currentUserResolver.userIdOf(authentication);
        if (userId == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        AuthService.ChangePasswordResult result = authService.changePassword(
                userId, request.currentPassword(), request.newPassword());
        return switch (result) {
            case SUCCESS -> ResponseEntity.noContent().build();
            case WRONG_CURRENT -> throw new BadRequestException("wrong_current_password");
            case USER_NOT_FOUND -> throw new UnauthorizedException("Not authenticated");
        };
    }


    @PostMapping("/me/name-change")
    @Operation(summary = "Change user name", description = "Changes the authenticated user's display name.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changeName(@Valid @RequestBody ChangeUsernameRequest request, Authentication authentication) {
        Long userId = currentUserResolver.userIdOf(authentication);
        if (userId == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        String newName = request.newUsername().trim();
        if (!userService.changeUsername(userId, newName)) {
            throw new BadRequestException("Invalid username");
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/email-change")
    @Operation(summary = "Change user email", description = "Starts an email change flow; the email only changes after verification.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changeEmail(@Valid @RequestBody ChangeEmailRequest request,
                                         Authentication authentication) {
        Long userId = currentUserResolver.userIdOf(authentication);
        if (userId == null) {
            throw new UnauthorizedException("Not authenticated");
        }

        try {
            authService.requestEmailChange(userId, request.newEmail());
            return ResponseEntity.accepted().body(Map.of("message", "verification_sent"));
        } catch (IllegalArgumentException ex) {
            throw new ConflictException("email_in_use");
        } catch (IllegalStateException ex) {
            throw new NotFoundException("User not found");
        }
    }

    @PostMapping("/me/delete-account")
    @Operation(summary = "Delete account", description = "Permanently deletes the authenticated user's account and all associated data.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        Long userID = currentUserResolver.userIdOf(authentication);
        if (userID == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        userService.deleteUserById(userID);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Account deleted successfully"));
    }

    private ResponseEntity<List<UserActionHistoryDto>> getActionsForUser(Long userId, Boolean active) {
        return ResponseEntity.ok(userActionHistoryService.getUserActions(userId, active));
    }

}