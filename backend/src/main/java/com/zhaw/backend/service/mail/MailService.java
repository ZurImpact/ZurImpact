package com.zhaw.backend.service.mail;

/**
 * Outbound mail contract. Production wires {@link SmtpMailService}; integration
 * tests wire via the "test" profile.
 */
public interface MailService {

    void sendVerificationEmail(String toEmail, String username, String verificationToken);

    void sendPasswordResetEmail(String toEmail, String username, String resetToken);
}
