package com.smartdesk.project.controller;

import com.smartdesk.project.dto.response.AuditLogResponse;
import org.springframework.http.ResponseEntity;
import com.smartdesk.project.repository.AuditLogRepository;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAll(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(
            auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AuditLogResponse::fromEntity)
                .collect(Collectors.toList())
        );
    }

}