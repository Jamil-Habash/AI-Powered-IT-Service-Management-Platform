package com.smartdesk.project.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateCommentRequest {
    
    @NotBlank(message = "Comment is Required")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
