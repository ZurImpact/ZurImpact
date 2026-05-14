package com.zhaw.backend.service.auth;

import com.zhaw.backend.enums.Role;
import jakarta.transaction.Transactional;

public interface AuthService {
    public AuthResult authenticate(String username, String rawPassword);

    public void register(String username, String email, String rawPassword);

    public void resendVerification(String email);

    public boolean verifyEmail(String rawToken);

    public void requestPasswordReset(String email);

    public boolean confirmPasswordReset(String rawToken, String newPassword);

    public ChangePasswordResult changePassword(Long userId, String currentPassword, String newPassword);

    public record AuthResult(Long userId, String username, Role role) {}

    public enum ChangePasswordResult {
        SUCCESS, WRONG_CURRENT, USER_NOT_FOUND
    }
}
