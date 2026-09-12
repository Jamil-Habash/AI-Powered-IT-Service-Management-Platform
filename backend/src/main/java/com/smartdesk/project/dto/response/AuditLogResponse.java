package com.smartdesk.project.dto.response;

import com.smartdesk.project.models.AuditLog;
import java.util.Date;

public class AuditLogResponse {
    private Long id;
    private String action;
    private String targetType;
    private Long targetId;
    private String details;
    private String performedByName;
    private Date createdAt;

    public static AuditLogResponse fromEntity(AuditLog log) {
        AuditLogResponse dto = new AuditLogResponse();
        dto.id = log.getId();
        dto.action = log.getAction();
        dto.targetType = log.getTargetType();
        dto.targetId = log.getTargetId();
        dto.details = log.getDetails();
        dto.performedByName = log.getPerformedBy() != null ? log.getPerformedBy().getName() : "System";
        dto.createdAt = log.getCreatedAt();
        return dto;
    }

    public Long getId() { 
        return id; 
    }
    public String getAction() { 
        return action; 
    }
    public String getTargetType() { 
        return targetType; 
    }
    public Long getTargetId() { 
        return targetId; 
    }
    public String getDetails() { 
        return details; 
    }
    public String getPerformedByName() { 
        return performedByName; 
    }
    public Date getCreatedAt() { 
        return createdAt; 
    }
}