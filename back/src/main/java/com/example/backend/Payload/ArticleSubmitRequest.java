package com.example.backend.Payload;

import com.example.backend.Enums.ReviewType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Request DTO for submitting a new article manuscript. */
@Data
public class ArticleSubmitRequest {

    @NotNull(message = "Journal ID is required")
    private UUID journalId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Abstract is required")
    private String abstractText;

    private List<String> keywords = new ArrayList<>();

    @Valid
    private List<AuthorInfo> authors = new ArrayList<>();

    private List<ReferenceInfo> references = new ArrayList<>();

    private ReviewType reviewType = ReviewType.DOUBLE_BLIND;

    private String language = "en";

    private String fundingInfo;

    private String conflictOfInterest;

    private String license;

    // ── Nested DTOs ─────────────────────────────────────────────────

    @Data
    public static class AuthorInfo {
        @NotBlank
        private String fullName;
        private String email;
        private String orcid;
        private String affiliation;
        private String country;
        private boolean corresponding;
        private int orderIndex;
    }

    @Data
    public static class ReferenceInfo {
        @NotBlank
        private String text;
        private String doi;
        private String url;
        private int orderIndex;
    }
}

