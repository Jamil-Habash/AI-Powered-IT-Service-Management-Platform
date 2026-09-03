package com.smartdesk.project.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.smartdesk.project.models.*;
import java.util.List;

@Repository
public interface CategoryRepository extends CrudRepository<Category, Long>{
    
}
