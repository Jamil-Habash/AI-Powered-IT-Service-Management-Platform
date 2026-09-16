package com.smartdesk.project.controller;

import com.smartdesk.project.dto.request.CreateArticleRequest;
import com.smartdesk.project.dto.response.ArticleResponse;
import com.smartdesk.project.security.UserPrincipal;
import com.smartdesk.project.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge-base")
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;

    public KnowledgeBaseController(KnowledgeBaseService knowledgeBaseService) {
        this.knowledgeBaseService = knowledgeBaseService;
    }

    @GetMapping
    public List<ArticleResponse> getAll() {
        return knowledgeBaseService.getAll();
    }

    @GetMapping("/{id}")
    public ArticleResponse getById(@PathVariable Long id) {
        return knowledgeBaseService.getById(id);
    }

    @PostMapping
    public ResponseEntity<ArticleResponse> create(@Valid @RequestBody CreateArticleRequest request,
                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        ArticleResponse response = knowledgeBaseService.create(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody CreateArticleRequest request,
                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(knowledgeBaseService.update(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal UserPrincipal currentUser) {
        knowledgeBaseService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}