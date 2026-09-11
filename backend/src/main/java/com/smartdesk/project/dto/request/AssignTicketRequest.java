package com.smartdesk.project.dto.request;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {
    
    @NotNull(message = "Agent ID is Required")
    private Long agentId;

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
}
