package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.LoginRequest;
import com.smartdesk.project.dto.request.RegisterRequest;
import com.smartdesk.project.dto.request.ForgotPasswordRequest;
import com.smartdesk.project.dto.request.ResetPasswordRequest;
import com.smartdesk.project.dto.response.AuthResponse;
import com.smartdesk.project.dto.response.UserResponse;
import com.smartdesk.project.exception.ExceptionsHandler.DuplicateEmailException;
import com.smartdesk.project.exception.ExceptionsHandler.EmailNotVerifiedException;
import com.smartdesk.project.exception.ExceptionsHandler.InvalidCredentialsException;
import com.smartdesk.project.models.Role;
import com.smartdesk.project.models.User;
import com.smartdesk.project.models.VerificationToken;
import com.smartdesk.project.repository.UserRepository;
import com.smartdesk.project.repository.VerificationTokenRepository;
import com.smartdesk.project.security.JwtService;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.security.SecureRandom;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            VerificationTokenRepository verificationTokenRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
    }

    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        String email = request.getEmail().trim().toLowerCase();
        User user = new User(
                request.getName(),
            email,
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("jamhab35@gmail.com".equals(email) ? Role.ADMIN : Role.EMPLOYEE);
        user.setEmailVerified(false);

        User saved = userRepository.save(user);
        createAndSendVerificationCode(saved);

        return UserResponse.fromEntity(saved);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException();
        }

        if (!passwordEncoder.matches(request.getPassword(),user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token,user.getId(),user.getName(),user.getEmail(),user.getRole());
    }

    private void createAndSendVerificationCode(User user) {

        verificationTokenRepository.deleteByUserId(user.getId());
        String code = String.format("%06d",random.nextInt(1_000_000));

        Date expiryDate = new Date(System.currentTimeMillis() + (5 * 60 * 1000));

        VerificationToken verificationToken =new VerificationToken(code,user,expiryDate);

        verificationTokenRepository.save(verificationToken);
        emailService.sendVerificationEmail(user, code);
    }

    public void verifyEmail(String email, String code) {

        User user = userRepository.findByEmail(email).orElseThrow(() ->new IllegalArgumentException("Invalid verification request"));

        if (user.isEmailVerified()) {
            return;
        }

        VerificationToken verificationToken =verificationTokenRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Verification code not found"));

        if (verificationToken.getExpiryDate().before(new Date())) {

            verificationTokenRepository.delete(verificationToken);

            throw new IllegalArgumentException("Verification code has expired");
        }

        if (!verificationToken.getCode().equals(code)) {

            throw new IllegalArgumentException("Invalid verification code");
        }

        user.setEmailVerified(true);

        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
    }

    public void resendVerificationCode(String email) {

        User user = userRepository.findByEmail(email).orElseThrow(() ->new IllegalArgumentException("Invalid verification request"));

        if (user.isEmailVerified()) {
            return;
        }

        createAndSendVerificationCode(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return;
        }

        String token = java.util.UUID.randomUUID().toString();

        Date now = new Date();
        Date expiry = new Date(now.getTime() + 30 * 60 * 1000);

        System.out.println("NOW:    " + now);
        System.out.println("EXPIRY: " + expiry);

        user.setResetToken(token);
        user.setResetTokenExpiry(expiry);
        userRepository.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(),token);
        System.out.println("SAVED EXPIRY: " + user.getResetTokenExpiry());
    }

    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByResetToken(request.getToken()).orElseThrow(InvalidCredentialsException::new);

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().before(new Date())) {
            throw new InvalidCredentialsException();
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public void validateResetToken(String token) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(InvalidCredentialsException::new);

        if (user.getResetTokenExpiry() == null ||
            user.getResetTokenExpiry().before(new Date())) {
            throw new InvalidCredentialsException();
        }
    }
}