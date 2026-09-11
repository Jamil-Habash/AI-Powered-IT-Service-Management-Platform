package com.smartdesk.project.dto.request;

import jakarta.validation.constraints.NotNull;
import com.smartdesk.project.models.TicketStatus;

public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

     public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
    
}
