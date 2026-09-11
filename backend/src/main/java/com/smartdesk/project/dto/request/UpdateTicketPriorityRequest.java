package com.smartdesk.project.dto.request;

import jakarta.validation.constraints.NotNull;
import com.smartdesk.project.models.Priority;

public class UpdateTicketPriorityRequest {

    @NotNull(message = "Priority is required")
    private Priority priority;

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
}
