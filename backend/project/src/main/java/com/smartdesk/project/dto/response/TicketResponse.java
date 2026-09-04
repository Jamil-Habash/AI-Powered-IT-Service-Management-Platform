package com.smartdesk.project.dto.response;

import com.smartdesk.project.models.Priority;
import com.smartdesk.project.models.Ticket;
import com.smartdesk.project.models.TicketStatus;

import java.util.Date;

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
}