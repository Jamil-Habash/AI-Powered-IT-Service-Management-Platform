package com.smartdesk.project.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import com.smartdesk.project.dto.response.UserResponse;
import com.smartdesk.project.dto.response.AuthResponse;
import com.smartdesk.project.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import com.smartdesk.project.dto.request.UpdateUserRequest;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.smartdesk.project.security.JwtService;
import com.smartdesk.project.models.User;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {
    
    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/agents")
    public ResponseEntity<List<UserResponse>> listAgents() {
        return ResponseEntity.ok(userService.listAllAgents());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers() {
        return ResponseEntity.ok(userService.listAllUsers());
    }

    @PatchMapping("/user/{id}/update")
    public ResponseEntity<AuthResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (!id.equals(currentUser.getUser().getId())) {
            throw new AccessDeniedException("You can only update your own profile");
        }
        UserResponse updated = userService.updateUser(id, request);
        User updatedUser = currentUser.getUser();
        String token = jwtService.generateToken(new UserPrincipal(updatedUser));
        return ResponseEntity.ok(new AuthResponse(
            token,
            updated.getId(),
            updated.getName(),
            updated.getEmail(),
            updated.getRole()));
    }
}
