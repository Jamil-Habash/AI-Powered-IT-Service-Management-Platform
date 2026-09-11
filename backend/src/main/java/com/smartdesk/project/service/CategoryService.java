package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.CreateCategoryRequest;
import com.smartdesk.project.dto.response.CategoryResponse;
import com.smartdesk.project.dto.response.UserResponse;
import com.smartdesk.project.exception.ExceptionsHandler.ResourceNotFoundException;
import com.smartdesk.project.models.Category;
import com.smartdesk.project.repository.CategoryRepository;
import java.util.stream.Collectors;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAllCategories() {
        List<Category> category;

        category = categoryRepository.findAll();

        return category.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CategoryResponse addCategory(CreateCategoryRequest request) {
        Category category = new Category(request.getName(), request.getDescription());
        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }
}
