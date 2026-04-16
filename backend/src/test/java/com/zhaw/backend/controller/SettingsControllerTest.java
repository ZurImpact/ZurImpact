package com.zhaw.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SettingsController - Unit Tests")
class SettingsControllerTest {

    @Mock
    private Authentication authentication;

    @InjectMocks
    private SettingsController settingsController;

    @Nested
    @DisplayName("getSettings")
    class GetSettings {

        @Test
        @DisplayName("returns message and current username")
        void returnsMessageAndCurrentUsername() {
            when(authentication.getName()).thenReturn("alice");

            Map<String, Object> result = settingsController.getSettings(authentication);

            assertNotNull(result);
            assertEquals("Settings page accessible", result.get("message"));
            assertEquals("alice", result.get("loggedInAs"));
        }
    }

    @Nested
    @DisplayName("changeUsername")
    class ChangeUsername {

        @Test
        @DisplayName("returns old and new username in response")
        void returnsOldAndNewUsername() {
            when(authentication.getName()).thenReturn("alice");
            SettingsController.ChangeUsernameRequest request =
                    new SettingsController.ChangeUsernameRequest("alice.new");

            Map<String, Object> result = settingsController.changeUsername(request, authentication);

            assertNotNull(result);
            assertEquals("Username change accepted", result.get("message"));
            assertEquals("alice", result.get("oldUsername"));
            assertEquals("alice.new", result.get("newUsername"));
        }
    }
}

