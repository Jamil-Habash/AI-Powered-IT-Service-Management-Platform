package com.smartdesk.project.controller;

import com.smartdesk.project.dto.request.CreateTicketRequest;
import com.smartdesk.project.dto.response.TicketResponse;
import com.smartdesk.project.security.UserPrincipal;
import com.smartdesk.project.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
}