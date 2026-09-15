package com.smartdesk.project.dto.response;

import com.smartdesk.project.models.Priority;
import com.smartdesk.project.models.Ticket;
import com.smartdesk.project.models.TicketStatus;
import com.smartdesk.project.models.TicketAttachment;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private Priority priority;

    private Long categoryId;
    private String categoryName;

    private Long createdById;
    private String createdByName;

    private Long assignedAgentId;
    private String assignedAgentName;

    private Date createdAt;
    private Date updatedAt;
    private Date resolvedAt;
    private List<AttachmentResponse> attachments;

    private String aiSummary;
    private String aiSuggestedCategory;
    private Priority aiSuggestedPriority;
    private List<String> aiSuggestedActions;

    public static TicketResponse fromEntity(Ticket ticket) {
        TicketResponse dto = new TicketResponse();
        dto.id = ticket.getId();
        dto.title = ticket.getTitle();
        dto.description = ticket.getDescription();
        dto.status = ticket.getStatus();
        dto.priority = ticket.getPriority();

        if (ticket.getCategory() != null) {
            dto.categoryId = ticket.getCategory().getId();
            dto.categoryName = ticket.getCategory().getName();
        }

        if (ticket.getCreatedBy() != null) {
            dto.createdById = ticket.getCreatedBy().getId();
            dto.createdByName = ticket.getCreatedBy().getName();
        }

        if (ticket.getAssignedAgent() != null) {
            dto.assignedAgentId = ticket.getAssignedAgent().getId();
            dto.assignedAgentName = ticket.getAssignedAgent().getName();
        }

        dto.createdAt = ticket.getCreatedAt();
        dto.updatedAt = ticket.getUpdatedAt();
        dto.resolvedAt = ticket.getResolvedAt();
        dto.attachments = ticket.getAttachments() == null ? List.of() : ticket.getAttachments().stream()
            .map(AttachmentResponse::fromEntity)
            .collect(Collectors.toList());

        dto.aiSummary = ticket.getAiSummary();
        dto.aiSuggestedCategory = ticket.getAiSuggestedCategory();
        dto.aiSuggestedPriority = ticket.getAiSuggestedPriority();
        dto.aiSuggestedActions = ticket.getAiSuggestedActions() != null
                ? Arrays.asList(ticket.getAiSuggestedActions().split("\n"))
                : List.of();
        return dto;
    }

    public Long getId() { 
        return id; 
    }

    public String getTitle() { 
        return title; 
    }

    public String getDescription() { 
        return description; 
    }

    public TicketStatus getStatus() {
         return status; 
    }
    
    public Priority getPriority() { 
        return priority;
    }

    public Long getCategoryId() { 
        return categoryId;
    }

    public String getCategoryName() { 
        return categoryName;
    }

    public Long getCreatedById() {
         return createdById;
    }

    public String getCreatedByName() { 
        return createdByName; 
    }

    public Long getAssignedAgentId() { 
        return assignedAgentId; 
    }

    public String getAssignedAgentName() { 
        return assignedAgentName; 
    }

    public Date getCreatedAt() {
         return createdAt; 
    }

    public Date getUpdatedAt() { 
        return updatedAt; 
    }

    public Date getResolvedAt() {
         return resolvedAt; 
    }

    public List<AttachmentResponse> getAttachments() {
        return attachments;
    }

    public String getAiSummary() { 
        return aiSummary; 
    }
    public String getAiSuggestedCategory() { 
        return aiSuggestedCategory; 
    }
    public Priority getAiSuggestedPriority() { 
        return aiSuggestedPriority; 
    }
    public List<String> getAiSuggestedActions() { 
        return aiSuggestedActions; 
    }

    public static class AttachmentResponse {
        private Long id;
        private String fileName;
        private String contentType;
        private long fileSize;

        private static AttachmentResponse fromEntity(TicketAttachment attachment) {
            AttachmentResponse response = new AttachmentResponse();
            response.id = attachment.getId();
            response.fileName = attachment.getFileName();
            response.contentType = attachment.getContentType();
            response.fileSize = attachment.getFileSize();
            return response;
        }

        public Long getId() { 
            return id; 
        }
        public String getFileName() { 
            return fileName; 
        }
        public String getContentType() { 
            return contentType; 
        }
        public long getFileSize() { 
            return fileSize; 
        }
    }
}