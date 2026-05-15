package com.example.backend.Repository;

import com.example.backend.Entity.Review;
import com.example.backend.Enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ReviewRepo extends JpaRepository<Review, UUID> {

    List<Review> findAllByArticleId(UUID articleId);

    Page<Review> findAllByReviewerId(UUID reviewerId, Pageable pageable);

    Page<Review> findAllByReviewerIdAndStatus(UUID reviewerId, ReviewStatus status, Pageable pageable);

    boolean existsByArticleIdAndReviewerId(UUID articleId, UUID reviewerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewer.id = :reviewerId AND r.status = :status")
    long countByReviewerIdAndStatus(@Param("reviewerId") UUID reviewerId,
                                    @Param("status") ReviewStatus status);

    @Query("SELECT AVG(r.score) FROM Review r WHERE r.article.id = :articleId AND r.score IS NOT NULL")
    Double averageScoreByArticleId(@Param("articleId") UUID articleId);
}

