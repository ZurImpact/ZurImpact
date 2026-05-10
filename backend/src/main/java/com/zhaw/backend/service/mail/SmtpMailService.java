package com.zhaw.backend.service.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SmtpMailService implements MailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String appBaseUrl;

    public SmtpMailService(JavaMailSender mailSender,
                           @Value("${app.mail.from:no-reply@zurimpact.local}") String fromAddress,
                           @Value("${app.base-url:http://localhost:8080}") String appBaseUrl) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.appBaseUrl = appBaseUrl;
    }

    @Override
    public void sendVerificationEmail(String toEmail, String username, String verificationToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Verify your ZurImpact account");
        message.setText("Hello " + username + ",\n\n"
                + "Confirm your email by visiting:\n"
                + appBaseUrl + "/verify-email?token=" + verificationToken + "\n\n"
                + "If you did not create this account, ignore this message.\n");
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Reset your ZurImpact password");
        message.setText("Hello " + username + ",\n\n"
                + "Reset your password by visiting:\n"
                + appBaseUrl + "/reset-password?token=" + resetToken + "\n\n"
                + "This link expires in 30 minutes. If you did not request a reset, ignore this message.\n");
        mailSender.send(message);
    }
}
