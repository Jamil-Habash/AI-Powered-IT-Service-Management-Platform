package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.AssignTicketRequest;
import com.smartdesk.project.dto.request.CreateTicketRequest;
import com.smartdesk.project.dto.response.TicketResponse;
import com.smartdesk.project.exception.ExceptionsHandler.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.smartdesk.project.models.*;
import com.smartdesk.project.repository.CategoryRepository;
import com.smartdesk.project.repository.TicketRepository;
import com.smartdesk.project.repository.UserRepository;
import com.smartdesk.project.repository.TicketAttachmentRepository;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.smartdesk.project.dto.request.UpdateTicketStatusRequest;
import com.smartdesk.project.dto.request.UpdateTicketPriorityRequest;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final AuditLogService auditLogService;
    private final AIAnalysisService aiAnalysisService;

    public TicketService(TicketRepository ticketRepository, CategoryRepository categoryRepository, UserRepository userRepository,
        TicketAttachmentRepository attachmentRepository, AuditLogService auditLogService, AIAnalysisService aiAnalysisService) 
        {
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.attachmentRepository = attachmentRepository;
        this.auditLogService = auditLogService;
        this.aiAnalysisService = aiAnalysisService;
    }
    
    @Transactional
    public TicketResponse create(CreateTicketRequest request, List<MultipartFile> files, UserPrincipal currentUser) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        Priority priority = request.getPriority() == null ? Priority.MEDIUM : request.getPriority();
        Ticket ticket = new Ticket(request.getTitle(), request.getDescription(), TicketStatus.OPEN, priority);
        ticket.setCategory(category);
        ticket.setCreatedBy(currentUser.getUser());

        Ticket saved = ticketRepository.save(ticket);
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            try {
                TicketAttachment attachment = new TicketAttachment();
                attachment.setFileName(file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename());
                attachment.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
                attachment.setFileSize(file.getSize());
                attachment.setData(file.getBytes());
                attachment.setTicket(saved);
                attachmentRepository.save(attachment);
            } catch (IOException exception) {
                throw new IllegalArgumentException("Unable to read attachment: " + file.getOriginalFilename(), exception);
            }
        }
        final Long ticketId = saved.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                aiAnalysisService.analyzeTicketAsync(ticketId);
            }
        });
        return TicketResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public TicketAttachment getAttachment(Long ticketId, Long attachmentId, UserPrincipal currentUser) {
        getById(ticketId, currentUser);
        return attachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));
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

    private void requireStaff(UserPrincipal currentUser) {
        if (currentUser.getUser().getRole() == Role.EMPLOYEE) {
            throw new AccessDeniedException("Only IT agents or admins can perform this action");
        }
    }

    @Transactional
    public TicketResponse assign(Long ticketId, AssignTicketRequest request, UserPrincipal currentUser) {
        requireStaff(currentUser);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        User agent = userRepository.findById(request.getAgentId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getAgentId()));

        if (agent.getRole() == Role.EMPLOYEE) {
            throw new IllegalArgumentException("Cannot assign a ticket to an employee");
        }

        ticket.setAssignedAgent(agent);
        Ticket saved = ticketRepository.save(ticket);
        auditLogService.log("Assign", "TICKET", ticket.getId(), "Assigned to " + agent.getName(), currentUser.getUser());
        return TicketResponse.fromEntity(saved);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request, UserPrincipal currentUser) {
        requireStaff(currentUser);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticket.setStatus(request.getStatus());

        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(new java.util.Date());
        }

        Ticket saved = ticketRepository.save(ticket);
        auditLogService.log("STATUS_CHANGE", "TICKET", ticket.getId(), "Status Change to " + request.getStatus(), currentUser.getUser());
        return TicketResponse.fromEntity(saved);
    }

    @Transactional
    public TicketResponse updatePriority(Long ticketId, UpdateTicketPriorityRequest request, UserPrincipal currentUser) {
        requireStaff(currentUser);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticket.setPriority(request.getPriority());
        Ticket saved = ticketRepository.save(ticket);
        auditLogService.log("PRIORITY_CHANGE", "TICKET", ticket.getId(), "Priority changed to  " + request.getPriority(), currentUser.getUser());
        return TicketResponse.fromEntity(saved);
    }

    @Transactional
    public TicketResponse resolve(Long ticketId, UserPrincipal currentUser) {
        requireStaff(currentUser);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(new java.util.Date());

        Ticket saved = ticketRepository.save(ticket);
        auditLogService.log("RESOLVE", "TICKET", ticket.getId(), "Ticket Resolved", currentUser.getUser());
        return TicketResponse.fromEntity(saved);
    }
}