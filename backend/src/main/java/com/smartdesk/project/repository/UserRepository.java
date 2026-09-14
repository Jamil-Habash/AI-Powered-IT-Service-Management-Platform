package com.smartdesk.project.repository;

import com.smartdesk.project.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findAll();
    Optional<User> findByResetToken(String resetToken);
}
