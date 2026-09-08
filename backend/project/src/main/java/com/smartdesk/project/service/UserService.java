package com.smartdesk.project.service;

import java.util.stream.Collectors;
import com.smartdesk.project.models.Role;
import com.smartdesk.project.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.smartdesk.project.models.User;
import com.smartdesk.project.dto.response.UserResponse;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAllAgents() {
        List<User> agents;

        agents = userRepository.findByRole(Role.IT_AGENT);

        return agents.stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
