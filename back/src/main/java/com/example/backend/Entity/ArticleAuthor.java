 package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Represents an author (or co-author) of a scientific article.
 * Supports both registered system users and external authors identified only by name/email.
 */
@Entity
@Table(name = "article_authors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleAuthor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    /** Registered user in the system (nullable for external authors) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String email;

    /** ORCID iD — https://orcid.org/0000-0000-0000-0000 */
    private String orcid;

    private String affiliation;

    private String country;

    @Column(columnDefinition = "TEXT")
    private String bio;

    /** The corresponding author receives reviewer/editor notices */
    @Builder.Default
    @Column(name = "is_corresponding")
    private boolean corresponding = false;

    /** Display order on the article page */
    @Builder.Default
    @Column(name = "order_index")
    private Integer orderIndex = 0;
}

