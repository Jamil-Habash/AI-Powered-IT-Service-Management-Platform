package com.smartdesk.project.controller;

import com.smartdesk.project.dto.request.AssignTicketRequest;
import com.smartdesk.project.dto.request.CreateTicketRequest;
import com.smartdesk.project.dto.response.TicketResponse;
import com.smartdesk.project.security.UserPrincipal;
import com.smartdesk.project.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.smartdesk.project.dto.request.UpdateTicketRequest;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody CreateTicketRequest request, @AuthenticationPrincipal UserPrincipal currentUser) {
        TicketResponse response = ticketService.create(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> list(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ticketService.listForCurrentUser(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ticketService.getById(id, currentUser));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assign(@PathVariable Long id,@Valid @RequestBody AssignTicketRequest request, @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ticketService.assign(id, request, currentUser));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,@Valid @RequestBody UpdateTicketRequest request, @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, currentUser));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<TicketResponse> updatePriority(@PathVariable Long id, @Valid @RequestBody UpdateTicketRequest request, @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, currentUser));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<TicketResponse> resolve(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ticketService.resolve(id, currentUser));
    }
}