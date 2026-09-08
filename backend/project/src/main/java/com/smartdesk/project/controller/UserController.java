package com.smartdesk.project.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import com.smartdesk.project.dto.response.UserResponse;
import com.smartdesk.project.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {
    
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/agents")
    public ResponseEntity<List<UserResponse>> listAgents() {
        return ResponseEntity.ok(userService.listAllAgents());
    }
    
}
