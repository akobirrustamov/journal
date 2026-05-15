package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a single issue (volume/number) of a Journal.
 */
@Entity
@Table(name = "issues",
        uniqueConstraints = @UniqueConstraint(columnNames = {"journal_id", "volume_number", "issue_number"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_id", nullable = false)
    private Journal journal;

    @Column(name = "volume_number")
    private Integer volumeNumber;

    @Column(name = "issue_number")
    private Integer issueNumber;

    /** Optional special-issue title */
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "published_date")
    private LocalDate publishedDate;

    /** Whether this is the latest/current issue of the journal */
    @Builder.Default
    @Column(name = "is_current")
    private boolean current = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_image_id")
    private Attachment coverImage;

    @Column(unique = true)
    private String doi;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "issue", fetch = FetchType.LAZY)
    @OrderBy("pageStart ASC")
    @Builder.Default
    private List<Article> articles = new ArrayList<>();

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }
}

