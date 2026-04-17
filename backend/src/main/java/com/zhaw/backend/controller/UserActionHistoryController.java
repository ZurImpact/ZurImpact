package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.service.UserActionHistoryService;
import com.zhaw.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/userActionHistory")
@Tag(name = "UserActionHistory", description = "Endpoint to get user action history")
@RequiredArgsConstructor
public class UserActionHistoryController {

    private final UserActionHistoryService userActionHistoryService;
    private final UserService userService;

    /**
     * Returns the action history for a user, optionally filtered to active (in-progress) or completed actions.
     *
     * @param userId the user ID
     * @param active if true returns only in-progress actions, if false only completed, if omitted returns all
     * @return list of the user's action history entries
     */
    @GetMapping("/getUserActions")
    @Operation(summary = "Get user action history", description = "Returns all actions a user has interacted with.", tags = "User Progress")
    public ResponseEntity<List<UserActionHistoryDto>> getUserActions(
            @RequestParam(name = "userId") Long userId,
            @RequestParam(name = "active", required = false, defaultValue = "false") Boolean active,
            Authentication authentication) {
        try {
            if (!isAuthorizedUser(authentication, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<UserActionHistoryDto> dto = userActionHistoryService.getUserActions(userId, active);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    private boolean isAuthorizedUser(Authentication authentication, Long userId) {
        Long authenticatedUserId = getAuthenticatedUserId(authentication);
        return authenticatedUserId != null && authenticatedUserId.equals(userId);
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        String username = authentication == null ? null : authentication.getName();
        if (username == null) {
            return null;
        }
        return userService.findUserByUsername(username)
                .map(user -> user.getId())
                .orElse(null);
    }

}
