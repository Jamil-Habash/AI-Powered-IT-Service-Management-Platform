package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.RegisterRequest;
import com.smartdesk.project.dto.response.UserResponse;
import com.smartdesk.project.enums.Role;
import com.smartdesk.project.exception.DuplicateEmailException;
import com.smartdesk.project.models.User;
import com.smartdesk.project.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = new User(request.getName(), request.getEmail(),
                passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.EMPLOYEE);

        User saved = userRepository.save(user);

        return new UserResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }
}