package com.smartdesk.project.dto.response;

import com.smartdesk.project.models.Role;

public class AuthResponse {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private Role role;

    public AuthResponse(String token, Long userId, String name, String email, Role role) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getToken() { 
        return token; 
    }
    public Long getUserId() { 
        return userId;
     }
    public String getName() { 
        return name; 
    }
    public String getEmail() { 
        return email; 
    }
    public Role getRole() {
         return role; 
    }
}