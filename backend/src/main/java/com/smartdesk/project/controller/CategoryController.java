package com.smartdesk.project.controller;

import com.smartdesk.project.dto.request.CreateCategoryRequest;
import com.smartdesk.project.dto.response.CategoryResponse;
import com.smartdesk.project.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        return ResponseEntity.ok(categoryService.listAllCategories());
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> add(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.addCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CategoryResponse> edit(@Valid @RequestBody CreateCategoryRequest request, @PathVariable Long id) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }
}