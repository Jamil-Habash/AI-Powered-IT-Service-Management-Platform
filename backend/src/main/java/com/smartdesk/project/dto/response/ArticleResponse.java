package com.smartdesk.project.dto.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartdesk.project.dto.StepDto;
import com.smartdesk.project.models.KnowledgeBaseArticle;

import java.util.Date;
import java.util.List;

public class ArticleResponse {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Long id;
    private String title;
    private String category;
    private String icon;
    private List<StepDto> steps;
    private String createdByName;
    private Date createdAt;
    private Date updatedAt;

    public static ArticleResponse fromEntity(KnowledgeBaseArticle article) {
        ArticleResponse dto = new ArticleResponse();
        dto.id = article.getId();
        dto.title = article.getTitle();
        dto.category = article.getCategory();
        dto.icon = article.getIcon();
        dto.createdByName = article.getCreatedBy() != null ? article.getCreatedBy().getName() : "Unknown";
        dto.createdAt = article.getCreatedAt();
        dto.updatedAt = article.getUpdatedAt();

        try {
            dto.steps = MAPPER.readValue(article.getStepsJson(), MAPPER.getTypeFactory().constructCollectionType(List.class, StepDto.class));
        } catch (Exception e) {
            dto.steps = List.of();
        }
        return dto;
    }

    public Long getId() { 
        return id; 
    }
    public String getTitle() { 
        return title; 
    }
    public String getCategory() { 
        return category; 
    }
    public String getIcon() { 
        return icon; 
    }
    public List<StepDto> getSteps() { 
        return steps; 
    }
    public String getCreatedByName() { 
        return createdByName; 
    }
    public Date getCreatedAt() { 
        return createdAt; 
    }
    public Date getUpdatedAt() { 
        return updatedAt; 
    }
}