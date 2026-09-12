package com.smartdesk.project.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String targetType;
    private Long targetId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    @Column(updatable = false)
    private Date createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = new Date(); }

    public AuditLog() {}

    public AuditLog(String action, String targetType, Long targetId, String details, User performedBy) {
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.details = details;
        this.performedBy = performedBy;
    }

    public Long getId() { return id; }
    public String getAction() { return action; }
    public String getTargetType() { return targetType; }
    public Long getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public User getPerformedBy() { return performedBy; }
    public Date getCreatedAt() { return createdAt; }
}