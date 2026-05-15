package com.example.backend.Repository;

import com.example.backend.Entity.Journal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface JournalRepo extends JpaRepository<Journal, UUID> {

    Optional<Journal> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByIssnPrint(String issnPrint);

    boolean existsByIssnOnline(String issnOnline);

    Page<Journal> findAllByActiveTrue(Pageable pageable);

    @Query("SELECT j FROM Journal j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Journal> search(@Param("q") String query, Pageable pageable);
}

