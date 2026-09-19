package com.smartdesk.project.dto.response;

import java.util.Date;

public class ChatConversationResponse {
    private Long id;
    private String title;
    private Date updatedAt;

    public ChatConversationResponse(Long id, String title, Date updatedAt) {
        this.id = id;
        this.title = title;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }
}