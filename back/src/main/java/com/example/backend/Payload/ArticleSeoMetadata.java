package com.example.backend.Payload;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Contains all SEO metadata for an article:
 * - Standard HTML meta tags
 * - Open Graph (og:) tags
 * - Twitter Card tags
 * - Google Scholar (Highwire Press) citation_* tags
 * - Dublin Core DC.* tags
 * - Schema.org JSON-LD
 */
@Data
@Builder
public class ArticleSeoMetadata {

    // ── Standard HTML Meta Tags ──────────────────────────────────────
    private String metaTitle;
    private String metaDescription;
    private String metaKeywords;
    private String canonicalUrl;

    // ── Open Graph (og:) ─────────────────────────────────────────────
    private String ogTitle;
    private String ogDescription;
    private String ogType;        // "article"
    private String ogUrl;
    private String ogImage;

    // ── Twitter Card ─────────────────────────────────────────────────
    private String twitterCard;   // "summary_large_image"
    private String twitterTitle;
    private String twitterDescription;

    // ── Google Scholar / Highwire Press citation_* tags ──────────────
    private String citationTitle;
    private List<String> citationAuthorNames;
    private String citationJournalTitle;
    private String citationPublicationDate;
    private String citationVolume;
    private String citationIssue;
    private String citationFirstPage;
    private String citationLastPage;
    private String citationDoi;
    private String citationIssnPrint;
    private String citationIssnOnline;
    private String citationPdfUrl;
    private String citationAbstract;
    private List<String> citationKeywords;

    // ── Dublin Core ───────────────────────────────────────────────────
    private String dcTitle;
    private List<String> dcCreators;
    private String dcDescription;
    private List<String> dcSubjects;
    private String dcPublisher;
    private String dcDate;
    private String dcType;        // "Text"
    private String dcFormat;      // "application/pdf"
    private String dcIdentifier;  // DOI
    private String dcSource;      // ISSN
    private String dcLanguage;
    private String dcRights;      // License

    // ── Schema.org JSON-LD ────────────────────────────────────────────
    private String schemaOrgJsonLd;

    // ── robots meta ───────────────────────────────────────────────────
    private String robots;         // "index, follow"
}

