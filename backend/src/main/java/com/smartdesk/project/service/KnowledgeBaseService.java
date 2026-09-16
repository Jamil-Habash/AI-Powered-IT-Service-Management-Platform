package com.smartdesk.project.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartdesk.project.dto.request.CreateArticleRequest;
import com.smartdesk.project.dto.response.ArticleResponse;
import com.smartdesk.project.exception.ExceptionsHandler.ResourceNotFoundException;
import com.smartdesk.project.models.KnowledgeBaseArticle;
import com.smartdesk.project.models.Role;
import com.smartdesk.project.repository.KnowledgeBaseArticleRepository;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KnowledgeBaseService {

    private final KnowledgeBaseArticleRepository articleRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public KnowledgeBaseService(KnowledgeBaseArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Transactional(readOnly = true)
    public List<ArticleResponse> getAll() {
        return articleRepository.findAll().stream()
                .map(ArticleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ArticleResponse getById(Long id) {
        KnowledgeBaseArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        return ArticleResponse.fromEntity(article);
    }

    @Transactional
    public ArticleResponse create(CreateArticleRequest request, UserPrincipal currentUser) {
        requireStaff(currentUser);

        KnowledgeBaseArticle article = new KnowledgeBaseArticle();
        article.setTitle(request.getTitle());
        article.setCategory(request.getCategory());
        article.setIcon(request.getIcon());
        article.setCreatedBy(currentUser.getUser());

        try {
            article.setStepsJson(objectMapper.writeValueAsString(request.getSteps()));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid steps data");
        }

        KnowledgeBaseArticle saved = articleRepository.save(article);
        return ArticleResponse.fromEntity(saved);
    }

    @Transactional
    public ArticleResponse update(Long id, CreateArticleRequest request, UserPrincipal currentUser) {
        requireStaff(currentUser);

        KnowledgeBaseArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));

        article.setTitle(request.getTitle());
        article.setCategory(request.getCategory());
        article.setIcon(request.getIcon());

        try {
            article.setStepsJson(objectMapper.writeValueAsString(request.getSteps()));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid steps data");
        }

        KnowledgeBaseArticle saved = articleRepository.save(article);
        return ArticleResponse.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id, UserPrincipal currentUser) {
        if (currentUser.getUser().getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can delete articles");
        }

        KnowledgeBaseArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        articleRepository.delete(article);
    }

    private void requireStaff(UserPrincipal currentUser) {
        if (currentUser.getUser().getRole() == Role.EMPLOYEE) {
            throw new AccessDeniedException("Only IT agents or admins can manage knowledge base articles");
        }
    }
}