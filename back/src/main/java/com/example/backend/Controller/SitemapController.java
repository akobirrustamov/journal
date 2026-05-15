package com.example.backend.Controller;

import com.example.backend.Entity.Article;
import com.example.backend.Entity.Journal;
import com.example.backend.Enums.ArticleStatus;
import com.example.backend.Repository.ArticleRepo;
import com.example.backend.Repository.JournalRepo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Serves SEO-critical resources for search engine crawlers:
 *
 * GET /sitemap.xml    – XML sitemap with journal and article URLs
 * GET /robots.txt     – robots.txt directing crawlers to sitemap
 *
 * Google Search Console, Google Scholar, and other crawlers use these
 * to discover and index all published content automatically.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "SEO", description = "robots.txt and sitemap.xml for search engine indexing")
public class SitemapController {

    private final JournalRepo journalRepo;
    private final ArticleRepo articleRepo;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    @Operation(summary = "robots.txt – instructs crawlers to index all published content")
    public ResponseEntity<String> robots() {
        String robots = "User-agent: *\n"
                + "Allow: /\n"
                + "Disallow: /api/v1/admin/\n"
                + "Disallow: /api/v1/reviews/\n"
                + "Disallow: /swagger-ui/\n"
                + "Disallow: /v3/api-docs/\n"
                + "\n"
                + "Sitemap: " + baseUrl + "/sitemap.xml\n";
        return ResponseEntity.ok(robots);
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "XML sitemap with all journals, issues, and published articles")
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"\n");
        xml.append("        xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\">\n");

        // Homepage
        appendUrl(xml, baseUrl + "/", "1.0", "daily");

        // Journals page
        appendUrl(xml, baseUrl + "/journals", "0.9", "weekly");

        // Each journal
        List<Journal> journals = journalRepo.findAll();
        for (Journal j : journals) {
            appendUrl(xml, baseUrl + "/journals/" + j.getSlug(), "0.8", "weekly");
        }

        // Published articles – up to 50000 (sitemap limit)
        List<Article> articles = articleRepo.findAllByStatus(ArticleStatus.PUBLISHED,
                PageRequest.of(0, 50000)).getContent();

        for (Article a : articles) {
            StringBuilder entry = new StringBuilder();
            entry.append("  <url>\n");
            entry.append("    <loc>").append(baseUrl).append("/articles/").append(a.getSlug()).append("</loc>\n");
            if (a.getPublishedAt() != null)
                entry.append("    <lastmod>").append(a.getPublishedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)).append("</lastmod>\n");
            entry.append("    <changefreq>monthly</changefreq>\n");
            entry.append("    <priority>0.9</priority>\n");

            // Google News extension for recently published articles
            if (a.getPublishedAt() != null && a.getPublishedAt().isAfter(
                    java.time.LocalDateTime.now().minusDays(2))) {
                entry.append("    <news:news>\n");
                entry.append("      <news:publication>\n");
                if (a.getJournal() != null)
                    entry.append("        <news:name>").append(escapeXml(a.getJournal().getTitle())).append("</news:name>\n");
                entry.append("        <news:language>").append(a.getLanguage() != null ? a.getLanguage() : "en").append("</news:language>\n");
                entry.append("      </news:publication>\n");
                entry.append("      <news:publication_date>").append(a.getPublishedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)).append("</news:publication_date>\n");
                entry.append("      <news:title>").append(escapeXml(a.getTitle())).append("</news:title>\n");
                entry.append("    </news:news>\n");
            }
            entry.append("  </url>\n");
            xml.append(entry);
        }

        xml.append("</urlset>");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(xml.toString());
    }

    private void appendUrl(StringBuilder xml, String loc, String priority, String changefreq) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(loc).append("</loc>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    private String escapeXml(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}

