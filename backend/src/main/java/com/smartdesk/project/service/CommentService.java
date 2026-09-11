package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.CreateCommentRequest;
import com.smartdesk.project.dto.response.CommentResponse;
import com.smartdesk.project.exception.ExceptionsHandler.ResourceNotFoundException;
import com.smartdesk.project.models.*;
import com.smartdesk.project.repository.CommentRepository;
import com.smartdesk.project.repository.TicketRepository;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, CreateCommentRequest request, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        checkAccess(ticket, currentUser);

        Comment comment = new Comment(request.getContent());
        comment.setTicket(ticket);
        comment.setWrittenBy(currentUser.getUser());

        Comment saved = commentRepository.save(comment);
        return CommentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long ticketId, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        checkAccess(ticket, currentUser);

        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket).stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private void checkAccess(Ticket ticket, UserPrincipal currentUser) {
        boolean isOwner = ticket.getCreatedBy() != null
                && ticket.getCreatedBy().getId().equals(currentUser.getUser().getId());
        boolean isStaff = currentUser.getUser().getRole() != Role.EMPLOYEE;

        if (!isOwner && !isStaff) {
            throw new ResourceNotFoundException("Ticket not found: " + ticket.getId());
        }
    }
}