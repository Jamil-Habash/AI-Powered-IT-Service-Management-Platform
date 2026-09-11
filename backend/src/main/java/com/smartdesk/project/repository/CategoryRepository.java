package com.smartdesk.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartdesk.project.models.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long>{

    List<Category> findAll();
    Optional<Category> findById(Long id);
}
