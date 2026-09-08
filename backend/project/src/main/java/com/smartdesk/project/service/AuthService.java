package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.LoginRequest;
import com.smartdesk.project.dto.request.RegisterRequest;
import com.smartdesk.project.dto.response.AuthResponse;
import com.smartdesk.project.dto.response.UserResponse;
import com.smartdesk.project.models.Role;
import com.smartdesk.project.exception.ExceptionsHandler.DuplicateEmailException;
import com.smartdesk.project.exception.ExceptionsHandler.InvalidCredentialsException;
import com.smartdesk.project.models.User;
import com.smartdesk.project.repository.UserRepository;
import com.smartdesk.project.security.JwtService;
import com.smartdesk.project.security.UserPrincipal;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = new User(request.getName(), request.getEmail(),
                passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.EMPLOYEE);

        User saved = userRepository.save(user);

        return UserResponse.fromEntity(saved);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}