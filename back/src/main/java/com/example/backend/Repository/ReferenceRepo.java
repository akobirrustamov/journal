package com.example.backend.Repository;

import com.example.backend.Entity.Reference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReferenceRepo extends JpaRepository<Reference, UUID> {
    List<Reference> findAllByArticleIdOrderByOrderIndexAsc(UUID articleId);
}

