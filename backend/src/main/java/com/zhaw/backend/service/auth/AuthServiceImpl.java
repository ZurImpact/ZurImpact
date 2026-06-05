package com.zhaw.backend.service.auth;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.entities.User;
import com.zhaw.backend.service.mail.MailService;
import com.zhaw.backend.service.session.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserDao userDao;
    private final SessionService sessionService;
    private final EmailVerificationTokenService verificationTokenService;
    private final PasswordResetTokenService resetTokenService;
    private final MailService mailService;
    private final EmailChangeTokenService emailChangeTokenService;

    /**
     * Authenticates a username/password and returns the authenticated user.
     * Throws {@link BadCredentialsException} for unknown user or wrong password,
     * and {@link DisabledException} when the account exists but the email is not verified yet.
     */
    @Override
    @Transactional
    public AuthResult authenticate(String username, String rawPassword) {
        Optional<User> userOpt = userDao.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid username or password");
        }
        User user = userOpt.get();

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new DisabledException("email_not_verified");
        }

        if (user.getRole() == null) {
            throw new DisabledException("No user role assigned");
        }

        return new AuthResult(user.getId(), user.getUsername(), Role.valueOf(user.getRole()));
    }

    /**
     * Self-serve registration. Rejects duplicate username/email and returns a 409 via controller.
     */
    @Override
    @Transactional
    public void register(String username, String email, String rawPassword) {
        Optional<User> existingByUsername = userDao.findByUsername(username);
        Optional<User> existingByEmail = userDao.findByEmail(email);

        if (existingByUsername.isPresent()) {
            throw new IllegalArgumentException("username_taken");
        }
        if (existingByEmail.isPresent()) {
            throw new IllegalArgumentException("email_taken");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .createdAt(LocalDateTime.now())
                .points(0)
                .role(Role.ROLE_USER.name())
                .emailVerified(Boolean.FALSE)
                .build();
        User saved = userDao.save(user);
        String token = verificationTokenService.issue(saved.getId());
        mailService.sendVerificationEmail(email, username, token);
    }

    /**
     * Re-sends a verification email for an existing unverified account. Always silent.
     */
    @Override
    @Transactional
    public void resendVerification(String email) {
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return;
        }
        verificationTokenService.invalidateAllForUser(user.getId());
        String token = verificationTokenService.issue(user.getId());
        mailService.sendVerificationEmail(user.getEmail(), user.getUsername(), token);
    }

    /**
     * Consumes a single-use verification token. Returns true on success.
     */
    @Override
    @Transactional
    public boolean verifyEmail(String rawToken) {
        return verificationTokenService.lookupValid(rawToken).map(token -> {
            userDao.markEmailVerified(token.getUserId());
            verificationTokenService.markConsumed(rawToken);
            return Boolean.TRUE;
        }).orElse(Boolean.FALSE);
    }

    /**
     * Sends a password-reset email if the address belongs to a verified account. Always silent.
     */
    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();
        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            return;
        }
        resetTokenService.invalidateAllForUser(user.getId());
        String token = resetTokenService.issue(user.getId());
        mailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);
    }

    /**
     * Consumes the reset token, sets the new password, and revokes every active
     * session for the user. Returns true on success.
     */
    @Override
    @Transactional
    public boolean confirmPasswordReset(String rawToken, String newPassword) {
        return resetTokenService.lookupValid(rawToken).map(token -> {
            String newHash = passwordEncoder.encode(newPassword);
            userDao.setPasswordHash(token.getUserId(), newHash);
            resetTokenService.markConsumed(rawToken);
            sessionService.invalidateAllForUser(token.getUserId());
            return Boolean.TRUE;
        }).orElse(Boolean.FALSE);
    }

    /**
     * In-app password change. Verifies the current password, updates the hash,
     * and revokes every session for the user (including the caller's). The
     * client must log in again with the new password.
     *
     * @return ChangePasswordResult.SUCCESS / WRONG_CURRENT / USER_NOT_FOUND
     */
    @Override
    @Transactional
    public ChangePasswordResult changePassword(Long userId,
                                               String currentPassword,
                                               String newPassword) {
        Optional<User> userOpt = userDao.findById(userId);
        if (userOpt.isEmpty()) {
            return ChangePasswordResult.USER_NOT_FOUND;
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return ChangePasswordResult.WRONG_CURRENT;
        }
        String newHash = passwordEncoder.encode(newPassword);
        userDao.setPasswordHash(userId, newHash);
        sessionService.invalidateAllForUser(userId);
        return ChangePasswordResult.SUCCESS;
    }

    @Override
    @Transactional
    public void requestEmailChange(Long userId, String newEmail) {
        Optional<User> userOpt = userDao.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalStateException("user_not_found");
        }

        // Prevent duplicate email
        if (userDao.findByEmail(newEmail).isPresent()) {
            throw new IllegalArgumentException("email_in_use");
        }

        emailChangeTokenService.invalidateAllForUser(userId);
        String token = emailChangeTokenService.issue(userId, newEmail);
        mailService.sendEmailChangeVerificationEmail(newEmail, userOpt.get().getUsername(), token);
    }

    @Override
    @Transactional
    public boolean confirmEmailChange(String rawToken) {
        return emailChangeTokenService.lookupValid(rawToken).map(token -> {
            userDao.updateEmail(token.getUserId(), token.getNewEmail());
            userDao.markEmailVerified(token.getUserId());
            emailChangeTokenService.markConsumed(rawToken);
            return Boolean.TRUE;
        }).orElse(Boolean.FALSE);
    }
}
