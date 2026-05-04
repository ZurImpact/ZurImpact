package com.zhaw.backend.controller;

import com.zhaw.backend.model.entities.User;
import com.zhaw.backend.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController - Unit Tests")
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @Test
    @DisplayName("getUser returns 200 when user exists")
    void getUser_returns200WhenUserExists() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .points(100)
                .role("ROLE_USER")
                .build();
        when(userService.findUserById(1L)).thenReturn(Optional.of(user));

        ResponseEntity<?> response = userController.getUser(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("getUser returns 404 when user does not exist")
    void getUser_returns404WhenUserDoesNotExist() {
        when(userService.findUserById(99L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userController.getUser(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
