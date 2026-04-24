package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.entities.User;
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
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserActionHistoryController - Unit Tests")
class UserActionHistoryControllerTest {

    @Mock
    private UserActionHistoryService userActionHistoryService;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserActionHistoryController controller;

    @Nested
    @DisplayName("getUserActions")
    class GetUserActions {

        @Test
        @DisplayName("returns 200 for authorized user")
        void returns200ForAuthorizedUser() {
            UserDto user = new UserDto();
            user.setId(7L);
            when(authentication.getName()).thenReturn("alice");
            when(userService.findUserByUsername("alice")).thenReturn(user);

            UserActionHistoryDto dto = UserActionHistoryDto.builder()
                    .actionId(1L)
                    .displayName("Bike to work")
                    .completionState("COMPLETED")
                    .build();
            when(userActionHistoryService.getUserActions(7L, true)).thenReturn(List.of(dto));

            ResponseEntity<List<UserActionHistoryDto>> response = controller.getUserActions(7L, true, authentication);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1, response.getBody().size());
            assertEquals(1L, response.getBody().getFirst().getActionId());
            verify(userActionHistoryService).getUserActions(7L, true);
        }

        @Test
        @DisplayName("returns 403 when authenticated user does not match requested userId")
        void returns403WhenUserIsNotAuthorized() {
            UserDto otherUser = new UserDto();
            otherUser.setId(99L);
            when(authentication.getName()).thenReturn("bob");
            when(userService.findUserByUsername("bob")).thenReturn(otherUser);

            ResponseEntity<List<UserActionHistoryDto>> response = controller.getUserActions(7L, true, authentication);

            assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
            verify(userActionHistoryService, never()).getUserActions(7L, true);
        }

        @Test
        @DisplayName("returns 403 when authentication is null")
        void returns403WhenAuthenticationIsNull() {
            ResponseEntity<List<UserActionHistoryDto>> response = controller.getUserActions(7L, true, null);

            assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
            verify(userActionHistoryService, never()).getUserActions(7L, true);
        }

        @Test
        @DisplayName("returns 500 when service throws exception")
        void returns500WhenServiceThrowsException() {
            UserDto user = new UserDto();
            user.setId(7L);
            when(authentication.getName()).thenReturn("alice");
            when(userService.findUserByUsername("alice")).thenReturn(user);
            when(userActionHistoryService.getUserActions(7L, false)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<List<UserActionHistoryDto>> response = controller.getUserActions(7L, false, authentication);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
            verify(userActionHistoryService).getUserActions(7L, false);
        }
    }
}

