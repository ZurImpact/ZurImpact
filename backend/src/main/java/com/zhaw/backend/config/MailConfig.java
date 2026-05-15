package com.zhaw.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * SMTP transport for verification and password-reset emails. Reads standard
 * Spring mail properties from the environment so existing .env-driven config
 * conventions in this project still work.
 *
 * <p>Defaults assume a no-auth dev relay (e.g. Mailpit on localhost:1025) so
 * the app boots without secrets. Whenever {@code spring.mail.username} is set
 * we auto-enable {@code mail.smtp.auth} unless the caller has overridden it
 * explicitly — this avoids the Jakarta Mail trap where setUsername forces
 * authentication even though no password is configured.
 */
@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(
            @Value("${spring.mail.host:localhost}") String host,
            @Value("${spring.mail.port:1025}") int port,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.protocol:smtp}") String protocol,
            @Value("${spring.mail.properties.mail.smtp.auth:}") String smtpAuth,
            @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}") String starttls) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        if (!username.isBlank()) {
            sender.setUsername(username);
        }
        if (!password.isBlank()) {
            sender.setPassword(password);
        }
        sender.setProtocol(protocol);

        String resolvedAuth = smtpAuth.isBlank()
                ? Boolean.toString(!username.isBlank())
                : smtpAuth;

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", resolvedAuth);
        props.put("mail.smtp.starttls.enable", starttls);
        return sender;
    }
}
