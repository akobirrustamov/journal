package com.example.backend.Payload;

import com.example.backend.Enums.PublicationFrequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/** Request DTO for creating or updating a Journal. */
@Data
public class JournalRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String titleAbbr;

    /** ISSN format: XXXX-XXXX */
    @Pattern(regexp = "^\\d{4}-\\d{3}[\\dX]$", message = "Invalid ISSN format (XXXX-XXXX)")
    private String issnPrint;

    @Pattern(regexp = "^\\d{4}-\\d{3}[\\dX]$", message = "Invalid ISSN format (XXXX-XXXX)")
    private String issnOnline;

    private String isbn;
    private String doi;
    private String description;
    private String shortDescription;
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
    private String phone;
    private String license;
}

