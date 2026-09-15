package com.smartdesk.project.repository;

import com.smartdesk.project.models.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByCode(String code);

    Optional<VerificationToken> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}