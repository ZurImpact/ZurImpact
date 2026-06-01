package com.zhaw.backend.controller;

import com.zhaw.backend.exception.BadRequestException;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.exception.UnauthorizedException;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.dto.auth.PasswordChangeRequest;
import com.zhaw.backend.model.entities.User;
import com.zhaw.backend.security.AuthenticatedUser;
import com.zhaw.backend.service.auth.AuthService;
import com.zhaw.backend.service.auth.EmailChangeTokenService;
import com.zhaw.backend.security.CurrentUserResolver;
import com.zhaw.backend.service.UserActionHistoryService;
import com.zhaw.backend.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController - Unit Tests")
class UserControllerTest {

    @Mock private UserService userService;
    @Mock private UserActionHistoryService userActionHistoryService;
    @Mock private AuthService authService;
    @Mock private EmailChangeTokenService emailChangeTokenService;
    @Mock private CurrentUserResolver currentUserResolver;

    @InjectMocks
    private UserController controller;

    @Nested
    @DisplayName("getUser")
    class GetUser {

        @Test
        @DisplayName("returns 200 when user exists")
        void getUserOk() {
            User user = User.builder().id(1L).username("alice").email("alice@example.com").points(100).role("ROLE_USER").build();
            when(userService.findUserById(1L)).thenReturn(Optional.of(user));
            when(emailChangeTokenService.hasPendingEmailToken(1L)).thenReturn(true);

            ResponseEntity<?> response = controller.getUser(1L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
        }

        @Test
        @DisplayName("throws NotFoundException when user does not exist")
        void getUserNotFound() {
            when(userService.findUserById(99L)).thenReturn(Optional.empty());

            assertThrows(NotFoundException.class, () -> controller.getUser(99L));
        }
    }

    @Nested
    @DisplayName("getUserActions")
    class GetUserActions {

        @Test
        @DisplayName("returns the action history list")
        void getActionsOk() {
            UserActionHistoryDto dto = UserActionHistoryDto.builder()
                    .actionId(1L)
                    .displayName("Bike to work")
                    .completionState("COMPLETED")
                    .build();
            when(userActionHistoryService.getUserActions(7L, true)).thenReturn(List.of(dto));

            ResponseEntity<List<UserActionHistoryDto>> response = controller.getUserActions(7L, true);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1, response.getBody().size());
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void getActionsFailure() {
            when(userActionHistoryService.getUserActions(7L, false)).thenThrow(new RuntimeException("db"));

            assertThrows(RuntimeException.class, () -> controller.getUserActions(7L, false));
        }
    }

    @Nested
    @DisplayName("changePassword")
    class ChangePassword {

        @Test
        @DisplayName("returns 204 on success")
        void changeSuccess() {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    new AuthenticatedUser(11L, "alice"), null, Set.of());
            when(currentUserResolver.userIdOf(auth)).thenReturn(11L);
            when(authService.changePassword(eq(11L), eq("old"), eq("newPassword123")))
                    .thenReturn(AuthService.ChangePasswordResult.SUCCESS);

            ResponseEntity<?> response = controller.changePassword(
                    new PasswordChangeRequest("old", "newPassword123"), auth);

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        }

        @Test
        @DisplayName("throws BadRequestException when current password is wrong")
        void changeWrongCurrent() {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    new AuthenticatedUser(11L, "alice"), null, Set.of());
            when(currentUserResolver.userIdOf(auth)).thenReturn(11L);
            when(authService.changePassword(eq(11L), eq("bad"), anyString()))
                    .thenReturn(AuthService.ChangePasswordResult.WRONG_CURRENT);

            BadRequestException ex = assertThrows(BadRequestException.class, () -> controller.changePassword(
                    new PasswordChangeRequest("bad", "newPassword123"), auth));
            assertEquals("wrong_current_password", ex.getMessage());
        }

        @Test
        @DisplayName("throws UnauthorizedException when no authenticated user is present")
        void changeUnauthenticated() {
            when(currentUserResolver.userIdOf(null)).thenReturn(null);

            assertThrows(UnauthorizedException.class, () -> controller.changePassword(
                    new PasswordChangeRequest("a", "newPassword123"), null));
            verify(authService, never()).changePassword(anyLong(), anyString(), anyString());
        }

        @Test
        @DisplayName("throws UnauthorizedException when user not found in DB")
        void changeUserNotFound() {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    new AuthenticatedUser(11L, "alice"), null, Set.of());
            when(currentUserResolver.userIdOf(auth)).thenReturn(11L);
            when(authService.changePassword(eq(11L), eq("old"), anyString()))
                    .thenReturn(AuthService.ChangePasswordResult.USER_NOT_FOUND);

            UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> controller.changePassword(
                    new PasswordChangeRequest("old", "newPassword123"), auth));
            assertEquals("Not authenticated", ex.getMessage());
        }
    }
}
