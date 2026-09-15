package com.smartdesk.project.service;

import com.smartdesk.project.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(User user, String code) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(user.getEmail());

        message.setSubject("SmartDesk — Verify your email");

        message.setText(
                "Hello " + user.getName() + ",\n\n" +

                "Thank you for registering with SmartDesk.\n\n" +

                "Your verification code is:\n\n" +

                "    " + code + "\n\n" +

                "This code will expire in 5 minutes.\n\n" +

                "Enter this code on the SmartDesk verification page " +
                "to activate your account.\n\n" +

                "If you did not create this account, " +
                "you can safely ignore this email.\n\n" +

                "SmartDesk"
        );

        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);

        message.setSubject("SmartDesk — Password Reset Request");

        message.setText(
                "You requested a password reset for your SmartDesk account.\n\n" +

                "Click the link below to set a new password " +
                "(valid for 30 minutes):\n" +

                resetLink + "\n\n" +

                "If you didn't request this, " +
                "you can safely ignore this email."
        );

        mailSender.send(message);
    }
}