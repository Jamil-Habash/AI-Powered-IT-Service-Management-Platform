package com.smartdesk.project.service;

import java.util.stream.Collectors;
import com.smartdesk.project.models.Role;
import com.smartdesk.project.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.smartdesk.project.models.User;
import com.smartdesk.project.dto.request.UpdateUserRequest;
import com.smartdesk.project.dto.response.UserResponse;
import com.smartdesk.project.exception.ExceptionsHandler.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAllAgents() {
        List<User> agents;

        agents = userRepository.findByRole(Role.IT_AGENT);

        return agents.stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAllUsers() {
        List<User> users;

        users = userRepository.findAll();

        return users.stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }
}
