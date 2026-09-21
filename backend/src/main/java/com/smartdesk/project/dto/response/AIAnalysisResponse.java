package com.smartdesk.project.dto.response;

import java.util.List;

public class AIAnalysisResponse {
    private String category;
    private String priority;
    private String summary;
    private List<String> suggestedActions;

    public String getCategory() { 
        return category; 
    }
    public void setCategory(String category) { 
        this.category = category; 
    }

    public String getPriority() { 
        return priority; 
    }
    public void setPriority(String priority) { 
        this.priority = priority; 
    }

    public String getSummary() { 
        return summary; 
    }
    public void setSummary(String summary) { 
        this.summary = summary; 
    }

    public List<String> getSuggestedActions() { 
        return suggestedActions; 
    }
    public void setSuggestedActions(List<String> suggestedActions) { 
        this.suggestedActions = suggestedActions; 
    }
}