package com.example.backend.Entity;

import com.example.backend.Enums.PublicationFrequency;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a scientific journal within the platform.
 * A journal contains multiple Issues, an editorial board, and metadata
 * for SEO and academic indexing (Google Scholar, CrossRef, etc.).
 */
@Entity
@Table(name = "journals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /** Full title of the journal */
    @Column(nullable = false)
    private String title;

    /** Abbreviated title (e.g. "J. Comput. Sci.") */
    @Column(name = "title_abbr")
    private String titleAbbr;

    /** SEO-friendly URL slug (auto-generated from title) */
    @Column(unique = true)
    private String slug;

    /** ISSN for print edition */
    @Column(name = "issn_print", length = 9)
    private String issnPrint;

    /** ISSN for online/electronic edition */
    @Column(name = "issn_online", length = 9)
    private String issnOnline;

    /** ISBN (for book-type journals / special issues) */
    @Column(length = 20)
    private String isbn;

    /** Digital Object Identifier for the journal itself */
    @Column(unique = true)
    private String doi;

    /** Full description / aims & scope */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Short description for listings */
    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    /** Cover image stored in attachment table */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_image_id")
    private Attachment coverImage;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_frequency")
    private PublicationFrequency publicationFrequency;

    @Column(name = "founded_year")
    private Integer foundedYear;

    private String publisher;

    /** Primary language of publications (ISO 639-1, e.g. "en") */
    @Builder.Default
    private String language = "en";

    private String country;

    /** Subject area / research domain */
    @Column(columnDefinition = "TEXT")
    private String scope;

    // ── SEO & Metadata ──────────────────────────────────────────────
    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(name = "meta_keywords", columnDefinition = "TEXT")
    private String metaKeywords;

    /** Open Access flag */
    @Builder.Default
    @Column(name = "is_open_access")
    private boolean openAccess = true;

    // ── Contact ──────────────────────────────────────────────────────
    private String website;
    private String email;
    private String phone;

    // ── License ──────────────────────────────────────────────────────
    /** e.g. "CC BY 4.0" */
    private String license;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Relationships ─────────────────────────────────────────────────
    @OneToMany(mappedBy = "journal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("publishedDate DESC")
    @Builder.Default
    private List<Issue> issues = new ArrayList<>();

    @OneToMany(mappedBy = "journal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<EditorialBoardMember> editorialBoard = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

