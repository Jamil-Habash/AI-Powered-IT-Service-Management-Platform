package com.smartdesk.project.controller;

import com.smartdesk.project.dto.response.CategoryResponse;
import com.smartdesk.project.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

	private final CategoryRepository categoryRepository;

	public CategoryController(CategoryRepository categoryRepository) {
		this.categoryRepository = categoryRepository;
	}

	@GetMapping
	public ResponseEntity<List<CategoryResponse>> list() {
		return ResponseEntity.ok(categoryRepository.findAll().stream()
				.map(CategoryResponse::fromEntity)
				.toList());
	}
}
