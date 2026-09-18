package com.smartdesk.project.controller;

import com.smartdesk.project.dto.request.ChatRequest;
import com.smartdesk.project.dto.request.CreateTicketFromChatRequest;
import com.smartdesk.project.dto.response.ChatMessageResponse;
import com.smartdesk.project.dto.response.ChatResponse;
import com.smartdesk.project.dto.response.TicketResponse;
import com.smartdesk.project.security.UserPrincipal;
import com.smartdesk.project.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request,
                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(chatService.chat(request, currentUser));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<List<ChatMessageResponse>> getHistory(@PathVariable Long conversationId,
                                                                 @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(chatService.getHistory(conversationId, currentUser));
    }

    @PostMapping("/ticket")
    public ResponseEntity<TicketResponse> createTicketFromChat(@Valid @RequestBody CreateTicketFromChatRequest request,
                                                                @AuthenticationPrincipal UserPrincipal currentUser) {
        TicketResponse response = chatService.createTicketFromChat(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}