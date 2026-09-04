package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.CreateTicketRequest;
import com.smartdesk.project.dto.response.TicketResponse;
import com.smartdesk.project.exception.ExceptionsHandler.ResourceNotFoundException;
import com.smartdesk.project.models.*;
import com.smartdesk.project.repository.CategoryRepository;
import com.smartdesk.project.repository.TicketRepository;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CategoryRepository categoryRepository;

    public TicketService(TicketRepository ticketRepository, CategoryRepository categoryRepository) {
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public TicketResponse create(CreateTicketRequest request, UserPrincipal currentUser) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        Ticket ticket = new Ticket(request.getTitle(), request.getDescription(), TicketStatus.OPEN, Priority.MEDIUM);
        ticket.setCategory(category);
        ticket.setCreatedBy(currentUser.getUser());

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> listForCurrentUser(UserPrincipal currentUser) {
        List<Ticket> tickets;

        if (currentUser.getUser().getRole() == Role.EMPLOYEE) {
            tickets = ticketRepository.findByCreatedBy(currentUser.getUser());
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse getById(Long id, UserPrincipal currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));

        boolean isOwner = ticket.getCreatedBy() != null
                && ticket.getCreatedBy().getId().equals(currentUser.getUser().getId());
        boolean isStaff = currentUser.getUser().getRole() != Role.EMPLOYEE;

        if (!isOwner && !isStaff) {
            throw new ResourceNotFoundException("Ticket not found: " + id);
        }

        return TicketResponse.fromEntity(ticket);
    }
}