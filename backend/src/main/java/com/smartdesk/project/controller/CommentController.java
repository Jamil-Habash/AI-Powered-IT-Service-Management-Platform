package com.smartdesk.project.controller;

import com.smartdesk.project.dto.request.CreateCommentRequest;
import com.smartdesk.project.dto.response.CommentResponse;
import com.smartdesk.project.security.UserPrincipal;
import com.smartdesk.project.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> add(@PathVariable Long ticketId, @Valid @RequestBody CreateCommentRequest request, @AuthenticationPrincipal UserPrincipal currentUser) {
        CommentResponse response = commentService.addComment(ticketId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> list(@PathVariable Long ticketId, @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(commentService.getComments(ticketId, currentUser));
    }
}