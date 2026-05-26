package com.example.backend.Payload;

import com.example.backend.Enums.PublicationFrequency;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/** Response DTO for Journal data returned to clients. */
@Data
@Builder
public class JournalResponse {
    private UUID id;
    private UUID coverImageId;
    private String title;
    private String titleAbbr;
    private String slug;
    private String issnPrint;
    private String issnOnline;
    private String isbn;
    private String doi;
    private String description;
    private String shortDescription;
    private String coverImageUrl;
    private String templateImageUrl;
    private PublicationFrequency publicationFrequency;
    private Integer foundedYear;
    private String publisher;
    private String language;
    private String country;
    private String scope;
    private String metaTitle;
    private String metaDescription;
    private String metaKeywords;
    private boolean openAccess;
    private String website;
    private String email;
    private String license;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int totalIssues;
    private int totalArticles;
}

