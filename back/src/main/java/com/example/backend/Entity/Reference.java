package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/** A bibliographic reference cited within a scientific article. */
@Entity
@Table(name = "references")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reference {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    /** Display order in the reference list */
    @Column(name = "order_index")
    private Integer orderIndex;

    /** Full formatted reference text */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    /** DOI of the referenced work */
    private String doi;

    /** URL of the referenced resource */
    private String url;
}

