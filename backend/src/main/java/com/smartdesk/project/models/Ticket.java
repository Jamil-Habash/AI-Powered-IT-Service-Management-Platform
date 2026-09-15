package com.smartdesk.project.models;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import org.springframework.format.annotation.DateTimeFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    private TicketStatus status;
    @Enumerated(EnumType.STRING)
    private Priority priority;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedAgent;

    @OneToMany(mappedBy = "ticket", fetch = FetchType.LAZY)
    private List<Comment> comments;

    @OneToMany(mappedBy = "ticket", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketAttachment> attachments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(updatable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date createdAt;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date updatedAt;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Enumerated(EnumType.STRING)
    private Priority aiSuggestedPriority;

    private String aiSuggestedCategory;

    @Column(columnDefinition = "TEXT")
    private String aiSuggestedActions;

    public Ticket() {
    
    }

    public Ticket(String title, String description, TicketStatus status, Priority priority) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

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

    public Date getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Date resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getAssignedAgent(){
        return assignedAgent;
    }

    public void setAssignedAgent(User assignedAgent){
        this.assignedAgent = assignedAgent;
    }

    public List<Comment> getComments(){
        return comments;
    }

    public void setComments(List<Comment> comments){
        this.comments = comments;
    }

    public List<TicketAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<TicketAttachment> attachments) {
        this.attachments = attachments;
    }

    public Category getCategory(){
        return category;
    }

    public void setCategory(Category category){
        this.category = category;
    }

    public Date getCreatedAt(){
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

    public String getAiSummary() { 
        return aiSummary; 
    }
    public void setAiSummary(String aiSummary) { 
        this.aiSummary = aiSummary; 
    }

    public Priority getAiSuggestedPriority() { 
        return aiSuggestedPriority; 
    }
    public void setAiSuggestedPriority(Priority aiSuggestedPriority) { 
        this.aiSuggestedPriority = aiSuggestedPriority; 
    }

    public String getAiSuggestedCategory() { 
        return aiSuggestedCategory; 
    }
    public void setAiSuggestedCategory(String aiSuggestedCategory) { 
        this.aiSuggestedCategory = aiSuggestedCategory; 
    }

    public String getAiSuggestedActions() { 
        return aiSuggestedActions; 
    }
    public void setAiSuggestedActions(String aiSuggestedActions) { 
        this.aiSuggestedActions = aiSuggestedActions; 
    }
}
