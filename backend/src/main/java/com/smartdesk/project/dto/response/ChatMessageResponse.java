package com.smartdesk.project.dto.response;

import com.smartdesk.project.models.ChatMessage;
import com.smartdesk.project.models.ChatRole;

import java.util.Date;

public class ChatMessageResponse {
    private Long id;
    private ChatRole role;
    private String content;
    private Date createdAt;

    public static ChatMessageResponse fromEntity(ChatMessage message) {
        ChatMessageResponse dto = new ChatMessageResponse();
        dto.id = message.getId();
        dto.role = message.getRole();
        dto.content = message.getContent();
        dto.createdAt = message.getCreatedAt();
        return dto;
    }

    public Long getId() { 
        return id; 
    }
    public ChatRole getRole() { 
        return role; 
    }
    public String getContent() { 
        return content; 
    }
    public Date getCreatedAt() { 
        return createdAt; 
    }
}