package com.zhaw.backend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @GetMapping
    public Map<String, Object> getSettings(Authentication authentication) {
        // only available if logged in (SecurityConfig: authenticated())
        return Map.of(
                "message", "Settings page accessible",
                "loggedInAs", authentication.getName()
        );
    }

    @PatchMapping("/username")
    public Map<String, Object> changeUsername(@Valid @RequestBody ChangeUsernameRequest request,
                                              Authentication authentication) {
        // TODO: Write to db e.g. User over authentication.getName() and update session if needed
        return Map.of(
                "message", "Username change accepted",
                "oldUsername", authentication.getName(),
                "newUsername", request.newUsername()
        );
    }

    public record ChangeUsernameRequest(@NotBlank String newUsername) {}
}
