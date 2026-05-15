package com.example.backend.Repository;

import com.example.backend.Entity.Article;
import com.example.backend.Enums.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ArticleRepo extends JpaRepository<Article, UUID> {

    Optional<Article> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByDoi(String doi);

    Page<Article> findAllByStatus(ArticleStatus status, Pageable pageable);

    Page<Article> findAllByJournalIdAndStatus(UUID journalId, ArticleStatus status, Pageable pageable);

    Page<Article> findAllByIssueId(UUID issueId, Pageable pageable);

    Page<Article> findAllBySubmittedById(UUID userId, Pageable pageable);

    @Query("""
        SELECT a FROM Article a WHERE a.status = 'PUBLISHED' AND (
            LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(a.abstractText) LIKE LOWER(CONCAT('%', :q, '%'))
        )
    """)
    Page<Article> searchPublished(@Param("q") String query, Pageable pageable);

    @Query("""
        SELECT a FROM Article a JOIN a.keywords k WHERE a.status = 'PUBLISHED'
        AND LOWER(k) LIKE LOWER(CONCAT('%', :kw, '%'))
    """)
    Page<Article> searchByKeyword(@Param("kw") String keyword, Pageable pageable);

    /** Atomically increment view count to avoid race conditions */
    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") UUID id);

    /** Atomically increment download count */
    @Modifying
    @Query("UPDATE Article a SET a.downloadCount = a.downloadCount + 1 WHERE a.id = :id")
    void incrementDownloadCount(@Param("id") UUID id);
}

