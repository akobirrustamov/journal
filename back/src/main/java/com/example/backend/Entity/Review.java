package com.example.backend.Entity;

import com.example.backend.Enums.ReviewDecision;
import com.example.backend.Enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a peer-review assignment for a scientific article.
 * Supports blind, double-blind, and open review workflows.
 */
@Entity
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    private User assignedBy;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ReviewDecision decision;

    /** Public comments visible to the author */
    @Column(name = "comments_for_author", columnDefinition = "TEXT")
    private String commentsForAuthor;

    /** Private comments visible only to the editor */
    @Column(name = "comments_for_editor", columnDefinition = "TEXT")
    private String commentsForEditor;

    /** Overall quality score (1–10) */
    private Integer score;

    // ── Originality score (0-10) ───────────────────────────────────
    @Column(name = "score_originality")
    private Integer scoreOriginality;

    // ── Methodology score (0-10) ──────────────────────────────────
    @Column(name = "score_methodology")
    private Integer scoreMethodology;

    // ── Clarity score (0-10) ──────────────────────────────────────
    @Column(name = "score_clarity")
    private Integer scoreClarity;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "invited_at")
    private LocalDateTime invitedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReviewFile> files = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        invitedAt = LocalDateTime.now();
    }
}

