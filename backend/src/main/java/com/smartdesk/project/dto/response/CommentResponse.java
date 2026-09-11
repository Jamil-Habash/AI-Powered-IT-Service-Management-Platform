package com.smartdesk.project.dto.response;

import java.util.Date;
import com.smartdesk.project.models.Comment;

public class CommentResponse {
    
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private Date createdAt;

    public static CommentResponse fromEntity(Comment comment) {
        CommentResponse dto = new CommentResponse();
        dto.id = comment.getId();
        dto.content = comment.getContent();
        if (comment.getWrittenBy() != null) {
            dto.authorId = comment.getWrittenBy().getId();
            dto.authorName = comment.getWrittenBy().getName();
        }
        dto.createdAt = comment.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }


    public Long getAuthorId(){
        return authorId;
    }


    public String getAuthorName(){
        return authorName;
    }

    public Date getCreatedAt() { 
        return createdAt; 
    }

}
