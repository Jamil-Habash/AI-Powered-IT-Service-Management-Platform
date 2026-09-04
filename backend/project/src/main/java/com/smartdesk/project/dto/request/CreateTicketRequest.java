package com.smartdesk.project.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    public String getTitle() { 
        return title; 
    }
    public void setTitle(String title) { 
        this.title = title; 
    }

    public String getDescription() { 
        return description; 
    }
    public void setDescription(String description) { 
        this.description = description; 
    }

    public Long getCategoryId() { 
        return categoryId; 
    }
    public void setCategoryId(Long categoryId) { 
        this.categoryId = categoryId; 
    }
}