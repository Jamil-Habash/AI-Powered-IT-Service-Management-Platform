package com.smartdesk.project.repository;

import com.smartdesk.project.models.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
	List<ChatConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);
}