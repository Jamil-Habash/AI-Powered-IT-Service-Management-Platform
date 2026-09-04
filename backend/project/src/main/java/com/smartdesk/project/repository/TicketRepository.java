package com.smartdesk.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartdesk.project.models.*;
import java.util.List;


public interface TicketRepository extends JpaRepository<Ticket, Long>{
    
    List<Ticket> findByCreatedBy(User createdBy);
}
