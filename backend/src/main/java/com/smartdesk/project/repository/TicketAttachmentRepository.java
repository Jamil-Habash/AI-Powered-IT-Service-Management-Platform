package com.smartdesk.project.repository;

import com.smartdesk.project.models.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    Optional<TicketAttachment> findByIdAndTicketId(Long id, Long ticketId);
}
