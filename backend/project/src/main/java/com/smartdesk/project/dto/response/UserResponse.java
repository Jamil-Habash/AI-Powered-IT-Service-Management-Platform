package com.smartdesk.project.dto.response;
import com.smartdesk.project.models.User;
import com.smartdesk.project.models.Role;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;

    public static UserResponse fromEntity(User user){
        UserResponse dto = new UserResponse();
        dto.id = user.getId();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.role = user.getRole();
        return dto;
    }

    public Long getId() { 
        return id; 
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