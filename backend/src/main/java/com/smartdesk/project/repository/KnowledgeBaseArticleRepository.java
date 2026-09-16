package com.smartdesk.project.repository;

import com.smartdesk.project.models.KnowledgeBaseArticle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeBaseArticleRepository extends JpaRepository<KnowledgeBaseArticle, Long> {
}