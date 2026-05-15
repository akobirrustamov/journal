package com.example.backend.Config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Provides a no-op JavaMailSender for local development.
 * Active only when spring.mail.host=localhost.
 * Emails are not actually sent; failures are silently caught in EmailNotificationService.
 */
@Configuration
@Slf4j
public class MailConfig {

    @Bean
    @ConditionalOnProperty(name = "spring.mail.host", havingValue = "localhost")
    public JavaMailSender noOpMailSender() {
        log.warn("Dev mail sender active (spring.mail.host=localhost). Emails will not be delivered.");
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("localhost");
        sender.setPort(1025);
        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "false");
        return sender;
    }
}
