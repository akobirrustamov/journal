package com.example.backend.Entity;

import com.example.backend.Enums.ArticleStatus;
import com.example.backend.Enums.ReviewType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Core entity representing a scientific article / manuscript.
 *
 * Lifecycle: DRAFT → SUBMITTED → UNDER_REVIEW → REVISION_REQUIRED → ACCEPTED → PUBLISHED → ARCHIVED
 */
@Entity
@Table(name = "articles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    /** SEO-friendly URL slug, auto-generated and unique */
    @Column(unique = true)
    private String slug;

    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;

    /** Keywords stored as a simple collection */
    @ElementCollection
    @CollectionTable(name = "article_keywords",
            joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "keyword")
    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ArticleStatus status = ArticleStatus.SUBMITTED;

    /** CrossRef-registered Digital Object Identifier */
    @Column(unique = true)
    private String doi;

    // ── Journal / Issue assignment ────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_id", nullable = false)
    private Journal journal;

    /** Assigned when the article is accepted and placed in an issue */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id")
    private Issue issue;

    // ── Files ─────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pdf_file_id")
    private Attachment pdfFile;

    /** Full HTML rendering of the article for web display */
    @Column(name = "html_content", columnDefinition = "TEXT")
    private String htmlContent;

    // ── Submission metadata ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id")
    private User submittedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // ── Review configuration ────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "review_type")
    @Builder.Default
    private ReviewType reviewType = ReviewType.DOUBLE_BLIND;

    // ── Publication details ─────────────────────────────────────────
    @Column(name = "page_start")
    private Integer pageStart;

    @Column(name = "page_end")
    private Integer pageEnd;

    @Builder.Default
    private String language = "en";

    /** e.g. "CC BY 4.0" */
    private String license;

    @Column(name = "funding_info", columnDefinition = "TEXT")
    private String fundingInfo;

    @Column(name = "conflict_of_interest", columnDefinition = "TEXT")
    private String conflictOfInterest;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "accepted_date")
    private LocalDate acceptedDate;

    // ── SEO / Metadata ────────────────────────────────────────────────
    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    // ── Statistics ────────────────────────────────────────────────────
    @Builder.Default
    @Column(name = "view_count")
    private Long viewCount = 0L;

    @Builder.Default
    @Column(name = "download_count")
    private Long downloadCount = 0L;

    // ── Audit ─────────────────────────────────────────────────────────
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Relationships ─────────────────────────────────────────────────
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<ArticleAuthor> authors = new ArrayList<>();

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Reference> references = new ArrayList<>();

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}

