package com.example.backend.Services;

import com.example.backend.Entity.Article;
import com.example.backend.Entity.ArticleAuthor;
import com.example.backend.Payload.ArticleSeoMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service that generates complete SEO metadata for published articles.
 *
 * Covers:
 * - HTML meta tags (title, description, keywords, canonical)
 * - Open Graph tags (og:title, og:description, og:image, og:type)
 * - Twitter Card tags
 * - Google Scholar / Highwire Press citation_* tags
 * - Dublin Core DC.* metadata
 * - Schema.org JSON-LD (ScholarlyArticle)
 */
@Service
@RequiredArgsConstructor
public class SeoMetadataService {

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private final MinioStorageService storageService;

    public ArticleSeoMetadata buildArticleMetadata(Article article) {
        String articleUrl = baseUrl + "/articles/" + article.getSlug();
        String pdfUrl = article.getPdfFile() != null
                ? storageService.resolveUrl(article.getPdfFile()) : null;

        List<String> authorNames = article.getAuthors() != null
                ? article.getAuthors().stream().map(ArticleAuthor::getFullName).collect(Collectors.toList())
                : List.of();

        String journalTitle = article.getJournal() != null ? article.getJournal().getTitle() : "";
        String issnPrint    = article.getJournal() != null ? article.getJournal().getIssnPrint() : null;
        String issnOnline   = article.getJournal() != null ? article.getJournal().getIssnOnline() : null;
        String pubDate      = article.getPublishedAt() != null
                ? article.getPublishedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : "";

        String metaDesc = article.getMetaDescription() != null
                ? article.getMetaDescription()
                : truncate(article.getAbstractText(), 160);

        return ArticleSeoMetadata.builder()
                // ── HTML meta ─────────────────────────────────────────
                .metaTitle(article.getTitle() + " | " + journalTitle)
                .metaDescription(metaDesc)
                .metaKeywords(article.getKeywords() != null
                        ? String.join(", ", article.getKeywords()) : "")
                .canonicalUrl(articleUrl)
                .robots("index, follow")

                // ── Open Graph ────────────────────────────────────────
                .ogTitle(article.getTitle())
                .ogDescription(metaDesc)
                .ogType("article")
                .ogUrl(articleUrl)
                .ogImage(article.getJournal() != null && article.getJournal().getCoverImage() != null
                        ? storageService.resolveUrl(article.getJournal().getCoverImage()) : null)

                // ── Twitter Card ──────────────────────────────────────
                .twitterCard("summary_large_image")
                .twitterTitle(article.getTitle())
                .twitterDescription(metaDesc)

                // ── Google Scholar / Highwire Press ───────────────────
                .citationTitle(article.getTitle())
                .citationAuthorNames(authorNames)
                .citationJournalTitle(journalTitle)
                .citationPublicationDate(pubDate)
                .citationVolume(article.getIssue() != null && article.getIssue().getVolumeNumber() != null
                        ? String.valueOf(article.getIssue().getVolumeNumber()) : null)
                .citationIssue(article.getIssue() != null && article.getIssue().getIssueNumber() != null
                        ? String.valueOf(article.getIssue().getIssueNumber()) : null)
                .citationFirstPage(article.getPageStart() != null
                        ? String.valueOf(article.getPageStart()) : null)
                .citationLastPage(article.getPageEnd() != null
                        ? String.valueOf(article.getPageEnd()) : null)
                .citationDoi(article.getDoi())
                .citationIssnPrint(issnPrint)
                .citationIssnOnline(issnOnline)
                .citationPdfUrl(pdfUrl)
                .citationAbstract(article.getAbstractText())
                .citationKeywords(article.getKeywords())

                // ── Dublin Core ───────────────────────────────────────
                .dcTitle(article.getTitle())
                .dcCreators(authorNames)
                .dcDescription(article.getAbstractText())
                .dcSubjects(article.getKeywords())
                .dcPublisher(article.getJournal() != null ? article.getJournal().getPublisher() : null)
                .dcDate(pubDate)
                .dcType("Text")
                .dcFormat("application/pdf")
                .dcIdentifier(article.getDoi() != null ? "https://doi.org/" + article.getDoi() : articleUrl)
                .dcSource(issnPrint)
                .dcLanguage(article.getLanguage())
                .dcRights(article.getLicense())

                // ── Schema.org JSON-LD ────────────────────────────────
                .schemaOrgJsonLd(buildSchemaOrgJsonLd(article, authorNames, articleUrl, pdfUrl))

                .build();
    }

    /**
     * Builds Schema.org ScholarlyArticle JSON-LD structured data
     * for Google rich results and academic indexing.
     */
    private String buildSchemaOrgJsonLd(Article article, List<String> authorNames,
                                         String articleUrl, String pdfUrl) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        json.append("  \"@context\": \"https://schema.org\",\n");
        json.append("  \"@type\": \"ScholarlyArticle\",\n");
        json.append("  \"headline\": \"").append(escape(article.getTitle())).append("\",\n");
        json.append("  \"description\": \"").append(escape(truncate(article.getAbstractText(), 300))).append("\",\n");
        json.append("  \"url\": \"").append(articleUrl).append("\",\n");
        if (article.getDoi() != null)
            json.append("  \"sameAs\": \"https://doi.org/").append(article.getDoi()).append("\",\n");

        // Authors array
        json.append("  \"author\": [\n");
        for (int i = 0; i < authorNames.size(); i++) {
            json.append("    {\"@type\": \"Person\", \"name\": \"").append(escape(authorNames.get(i))).append("\"}");
            if (i < authorNames.size() - 1) json.append(",");
            json.append("\n");
        }
        json.append("  ],\n");

        // Journal
        if (article.getJournal() != null) {
            json.append("  \"isPartOf\": {\n");
            json.append("    \"@type\": \"Periodical\",\n");
            json.append("    \"name\": \"").append(escape(article.getJournal().getTitle())).append("\"");
            if (article.getJournal().getIssnPrint() != null)
                json.append(",\n    \"issn\": \"").append(article.getJournal().getIssnPrint()).append("\"");
            json.append("\n  },\n");
        }

        // Dates
        if (article.getPublishedAt() != null)
            json.append("  \"datePublished\": \"").append(article.getPublishedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)).append("\",\n");
        if (article.getSubmittedAt() != null)
            json.append("  \"dateCreated\": \"").append(article.getSubmittedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)).append("\",\n");

        // Keywords
        if (article.getKeywords() != null && !article.getKeywords().isEmpty())
            json.append("  \"keywords\": \"").append(String.join(", ", article.getKeywords())).append("\",\n");

        // PDF
        if (pdfUrl != null)
            json.append("  \"encoding\": {\"@type\": \"MediaObject\", \"contentUrl\": \"").append(pdfUrl).append("\", \"encodingFormat\": \"application/pdf\"},\n");

        if (article.getLicense() != null)
            json.append("  \"license\": \"").append(escape(article.getLicense())).append("\",\n");

        json.append("  \"inLanguage\": \"").append(article.getLanguage() != null ? article.getLanguage() : "en").append("\"\n");
        json.append("}");
        return json.toString();
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max - 3) + "...";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }
}

