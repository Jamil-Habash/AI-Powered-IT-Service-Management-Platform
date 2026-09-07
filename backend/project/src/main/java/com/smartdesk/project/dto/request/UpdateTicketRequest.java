package com.smartdesk.project.dto.request;

import jakarta.validation.constraints.NotNull;
import com.smartdesk.project.models.TicketStatus;
import com.smartdesk.project.models.Priority;


public class UpdateTicketRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    @NotNull(message = "Priority is required")
    private Priority priority;

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
}
