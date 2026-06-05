package com.zhaw.backend.service.auth;

import com.zhaw.backend.enums.Role;

public interface AuthService {
    AuthResult authenticate(String username, String rawPassword);

    void register(String username, String email, String rawPassword);

    void resendVerification(String email);

    boolean verifyEmail(String rawToken);

    void requestPasswordReset(String email);

    boolean confirmPasswordReset(String rawToken, String newPassword);

    ChangePasswordResult changePassword(Long userId, String currentPassword, String newPassword);

    record AuthResult(Long userId, String username, Role role) {
    }

    enum ChangePasswordResult {
        SUCCESS, WRONG_CURRENT, USER_NOT_FOUND
    }

    void requestEmailChange(Long userId, String newEmail);

    boolean confirmEmailChange(String rawToken);
}
