package com.smartdesk.project.dto;

import jakarta.validation.constraints.NotBlank;

public class StepDto {
    @NotBlank(message = "Step title is required")
    private String title;

    @NotBlank(message = "Step description is required")
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}