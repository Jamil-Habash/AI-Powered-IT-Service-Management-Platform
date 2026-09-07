package com.smartdesk.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartdesk.project.models.Comment;
import com.smartdesk.project.models.Ticket;
import java.util.List;


public interface CommentRepository extends JpaRepository<Comment, Long>{
    
    List<Comment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
}
