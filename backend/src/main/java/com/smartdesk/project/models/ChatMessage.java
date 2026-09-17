package com.smartdesk.project.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private ChatConversation conversation;

    @Enumerated(EnumType.STRING)
    private ChatRole role;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(updatable = false)
    private Date createdAt;

    @PrePersist
    protected void onCreate() { 
        this.createdAt = new Date(); 
    }

    public ChatMessage() {

    }

    public ChatMessage(ChatConversation conversation, ChatRole role, String content) {
        this.conversation = conversation;
        this.role = role;
        this.content = content;
    }

    public Long getId() { 
        return id; 
    }
    public ChatConversation getConversation() { 
        return conversation; 
    }
    public ChatRole getRole() { 
        return role; 
    }
    public String getContent() { 
        return content; 
    }
    public Date getCreatedAt() { 
        return createdAt; 
    }
}