package com.zhaw.backend.controller;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.dto.auth.DevLoginRequest;
import com.zhaw.backend.service.UserService;
import com.zhaw.backend.service.session.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DevAuthController - Unit Tests")
class DevAuthControllerTest {

    @Mock private UserService userService;
    @Mock private SessionService sessionService;
    @Mock private HttpServletRequest request;

    @InjectMocks
    private DevAuthController controller;

    @Test
    @DisplayName("throws NotFoundException when the user does not exist")
    void devLoginUnknownUser() {
        when(userService.findUserByUsername("ghost")).thenReturn(null);

        assertThrows(NotFoundException.class, () -> controller.devLogin(new DevLoginRequest("ghost"), request));
    }

    @Test
    @DisplayName("returns 200 with a session cookie and role for an existing user")
    void devLoginOk() {
        lenient().when(request.isSecure()).thenReturn(true);
        UserDto user = UserDto.builder().id(7L).username("alice").role(Role.ROLE_USER).build();
        when(userService.findUserByUsername("alice")).thenReturn(user);
        when(sessionService.createSession(7L)).thenReturn("dev-token");

        ResponseEntity<?> response = controller.devLogin(new DevLoginRequest("alice"), request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(cookie);
        assertTrue(cookie.contains("AUTH_SESSION=dev-token"));
        assertTrue(cookie.contains("HttpOnly"));
    }
}
