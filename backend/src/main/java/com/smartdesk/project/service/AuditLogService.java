package com.smartdesk.project.service;

import com.smartdesk.project.models.AuditLog;
import com.smartdesk.project.models.User;
import com.smartdesk.project.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String targetType, Long targetId, String details, User performedBy) {
        auditLogRepository.save(new AuditLog(action, targetType, targetId, details, performedBy));
    }
}