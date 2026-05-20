package com.zhaw.backend.service.mail;

/**
 * Outbound mail contract. Production wires {@link SmtpMailServiceImpl}; integration
 * tests wire via the "test" profile.
 */
public interface MailService {

    void sendVerificationEmail(String toEmail, String username, String verificationToken);

    void sendPasswordResetEmail(String toEmail, String username, String resetToken);

    void sendEmailChangeVerificationEmail(String toEmail, String username, String verificationToken);
}
