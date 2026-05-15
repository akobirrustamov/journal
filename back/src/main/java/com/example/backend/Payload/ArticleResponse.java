package com.example.backend.Payload;

import com.example.backend.Enums.ArticleStatus;
import com.example.backend.Enums.ReviewType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Full article representation returned to API clients. */
@Data
@Builder
public class ArticleResponse {
    private UUID id;
    private String title;
    private String slug;
    private String abstractText;
    private List<String> keywords;
    private ArticleStatus status;
    private String doi;

    // Journal / Issue context
    private UUID journalId;
    private String journalTitle;
    private String journalSlug;
    private UUID issueId;
    private Integer volumeNumber;
    private Integer issueNumber;

    // Files
    private String pdfUrl;
    private boolean hasHtml;

    // Authors
    private List<AuthorSummary> authors;

    // Review info
    private ReviewType reviewType;

    // Publication details
    private Integer pageStart;
    private Integer pageEnd;
    private String language;
    private String license;

    // Dates
    private LocalDate receivedDate;
    private LocalDate acceptedDate;
    private LocalDateTime submittedAt;
    private LocalDateTime publishedAt;

    // SEO
    private String metaTitle;
    private String metaDescription;

    // Statistics
    private Long viewCount;
    private Long downloadCount;

    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class AuthorSummary {
        private String fullName;
        private String orcid;
        private String affiliation;
        private boolean corresponding;
        private int orderIndex;
    }
}

