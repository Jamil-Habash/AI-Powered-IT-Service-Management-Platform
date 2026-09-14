package com.smartdesk.project.controller;

import com.smartdesk.project.dto.request.LoginRequest;
import com.smartdesk.project.dto.request.RegisterRequest;
import com.smartdesk.project.dto.request.ForgotPasswordRequest;
import com.smartdesk.project.dto.request.ResetPasswordRequest;
import com.smartdesk.project.dto.request.VerifyEmailRequest;
import com.smartdesk.project.dto.request.ResendVerificationRequest;

import com.smartdesk.project.dto.response.AuthResponse;
import com.smartdesk.project.dto.response.UserResponse;

import com.smartdesk.project.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        UserResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {

        authService.verifyEmail(
                request.getEmail(),
                request.getCode()
        );

        Map<String, String> body = new HashMap<>();
        body.put("message", "Email verified successfully.");

        return ResponseEntity.ok(body);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request
    ) {

        authService.resendVerificationCode(request.getEmail());

        Map<String, String> body = new HashMap<>();
        body.put("message", "A new verification code has been sent.");

        return ResponseEntity.ok(body);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        authService.forgotPassword(request);

        Map<String, String> body = new HashMap<>();
        body.put(
                "message",
                "If an account exists with that email, a reset link has been sent."
        );

        return ResponseEntity.ok(body);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        authService.resetPassword(request);

        Map<String, String> body = new HashMap<>();
        body.put("message", "Password has been reset successfully.");

        return ResponseEntity.ok(body);
    }
}