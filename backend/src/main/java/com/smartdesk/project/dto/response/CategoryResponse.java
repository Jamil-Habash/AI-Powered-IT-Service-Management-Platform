package com.smartdesk.project.dto.response;

import com.smartdesk.project.models.Category;

public record CategoryResponse(Long id, String name, String description) {
    public static CategoryResponse fromEntity(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }
}
