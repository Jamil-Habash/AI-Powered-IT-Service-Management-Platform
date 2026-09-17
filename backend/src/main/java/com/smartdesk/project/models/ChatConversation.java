package com.smartdesk.project.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "chat_conversations")
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(updatable = false)
    private Date createdAt;
    private Date updatedAt;

    @PrePersist
    protected void onCreate() { 
        this.createdAt = new Date(); 
        this.updatedAt = new Date(); 
    }

    @PreUpdate
    protected void onUpdate() { 
        this.updatedAt = new Date(); 
    }

    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public User getUser() { 
        return user; 
    }
    public void setUser(User user) { 
        this.user = user; 
    }

    public Date getCreatedAt() { 
        return createdAt; 
    }
    public Date getUpdatedAt() { 
        return updatedAt; 
    }
}