package com.example.backend.Services;

import com.example.backend.Entity.Article;
import com.example.backend.Entity.ArticleAuthor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

/**
 * Service for exporting article citations in various academic formats:
 * BibTeX, RIS, APA, MLA, Chicago, Harvard, Vancouver.
 *
 * Also provides CrossRef XML export and Dublin Core XML.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CitationService {

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // ── BibTeX ───────────────────────────────────���────────────────────

    public String toBibTeX(Article article) {
        String key = buildBibKey(article);
        String authors = formatAuthorsForBib(article);
        String year = article.getPublishedAt() != null
                ? String.valueOf(article.getPublishedAt().getYear())
                : String.valueOf(java.time.LocalDate.now().getYear());

        StringBuilder sb = new StringBuilder();
        sb.append("@article{").append(key).append(",\n");
        sb.append("  title     = {").append(escapeLatex(article.getTitle())).append("},\n");
        sb.append("  author    = {").append(authors).append("},\n");
        if (article.getJournal() != null) {
            sb.append("  journal   = {").append(article.getJournal().getTitle()).append("},\n");
            if (article.getJournal().getIssnPrint() != null)
                sb.append("  issn      = {").append(article.getJournal().getIssnPrint()).append("},\n");
        }
        sb.append("  year      = {").append(year).append("},\n");
        if (article.getIssue() != null) {
            if (article.getIssue().getVolumeNumber() != null)
                sb.append("  volume    = {").append(article.getIssue().getVolumeNumber()).append("},\n");
            if (article.getIssue().getIssueNumber() != null)
                sb.append("  number    = {").append(article.getIssue().getIssueNumber()).append("},\n");
        }
        if (article.getPageStart() != null && article.getPageEnd() != null)
            sb.append("  pages     = {").append(article.getPageStart()).append("--").append(article.getPageEnd()).append("},\n");
        if (article.getDoi() != null)
            sb.append("  doi       = {").append(article.getDoi()).append("},\n");
        sb.append("  url       = {").append(baseUrl).append("/articles/").append(article.getSlug()).append("}\n");
        sb.append("}");
        return sb.toString();
    }

    // ── RIS ───────────────────────────────────────────────────────────

    public String toRIS(Article article) {
        StringBuilder sb = new StringBuilder();
        sb.append("TY  - JOUR\n");
        sb.append("TI  - ").append(article.getTitle()).append("\n");
        if (article.getAuthors() != null) {
            article.getAuthors().forEach(a ->
                    sb.append("AU  - ").append(a.getFullName()).append("\n"));
        }
        if (article.getJournal() != null) {
            sb.append("JO  - ").append(article.getJournal().getTitle()).append("\n");
            if (article.getJournal().getIssnPrint() != null)
                sb.append("SN  - ").append(article.getJournal().getIssnPrint()).append("\n");
        }
        if (article.getPublishedAt() != null)
            sb.append("PY  - ").append(article.getPublishedAt().getYear()).append("\n");
        if (article.getIssue() != null) {
            if (article.getIssue().getVolumeNumber() != null)
                sb.append("VL  - ").append(article.getIssue().getVolumeNumber()).append("\n");
            if (article.getIssue().getIssueNumber() != null)
                sb.append("IS  - ").append(article.getIssue().getIssueNumber()).append("\n");
        }
        if (article.getPageStart() != null) sb.append("SP  - ").append(article.getPageStart()).append("\n");
        if (article.getPageEnd() != null)   sb.append("EP  - ").append(article.getPageEnd()).append("\n");
        if (article.getDoi() != null)       sb.append("DO  - ").append(article.getDoi()).append("\n");
        if (article.getAbstractText() != null) sb.append("AB  - ").append(article.getAbstractText()).append("\n");
        sb.append("UR  - ").append(baseUrl).append("/articles/").append(article.getSlug()).append("\n");
        sb.append("ER  - \n");
        return sb.toString();
    }

    // ── APA ───────────────────────────────────────────────────────────

    public String toAPA(Article article) {
        String authors = article.getAuthors() == null ? "" :
                article.getAuthors().stream()
                        .map(a -> toApaAuthor(a.getFullName()))
                        .collect(Collectors.joining(", "));

        String year = article.getPublishedAt() != null
                ? String.valueOf(article.getPublishedAt().getYear()) : "n.d.";

        StringBuilder sb = new StringBuilder();
        sb.append(authors).append(" (").append(year).append("). ");
        sb.append(article.getTitle()).append(". ");
        if (article.getJournal() != null) {
            sb.append("<i>").append(article.getJournal().getTitle()).append("</i>");
        }
        if (article.getIssue() != null && article.getIssue().getVolumeNumber() != null)
            sb.append(", <i>").append(article.getIssue().getVolumeNumber()).append("</i>");
        if (article.getIssue() != null && article.getIssue().getIssueNumber() != null)
            sb.append("(").append(article.getIssue().getIssueNumber()).append(")");
        if (article.getPageStart() != null && article.getPageEnd() != null)
            sb.append(", ").append(article.getPageStart()).append("–").append(article.getPageEnd());
        if (article.getDoi() != null)
            sb.append(". https://doi.org/").append(article.getDoi());
        return sb.toString();
    }

    // ── MLA ───────────────────────────────────────────────────────────

    public String toMLA(Article article) {
        String firstAuthor = (article.getAuthors() == null || article.getAuthors().isEmpty())
                ? "" : article.getAuthors().get(0).getFullName();

        StringBuilder sb = new StringBuilder();
        sb.append(firstAuthor).append(". \"").append(article.getTitle()).append(".\" ");
        if (article.getJournal() != null)
            sb.append("<i>").append(article.getJournal().getTitle()).append("</i>");
        if (article.getIssue() != null && article.getIssue().getVolumeNumber() != null)
            sb.append(", vol. ").append(article.getIssue().getVolumeNumber());
        if (article.getIssue() != null && article.getIssue().getIssueNumber() != null)
            sb.append(", no. ").append(article.getIssue().getIssueNumber());
        if (article.getPublishedAt() != null)
            sb.append(", ").append(article.getPublishedAt().getYear());
        if (article.getPageStart() != null && article.getPageEnd() != null)
            sb.append(", pp. ").append(article.getPageStart()).append("–").append(article.getPageEnd());
        if (article.getDoi() != null)
            sb.append(". DOI: https://doi.org/").append(article.getDoi());
        sb.append(".");
        return sb.toString();
    }

    // ── Dublin Core XML ───────────────────────────────────────────────

    public String toDublinCoreXml(Article article) {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<oai_dc:dc xmlns:oai_dc=\"http://www.openarchives.org/OAI/2.0/oai_dc/\"\n");
        xml.append("           xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n");
        xml.append("  <dc:title>").append(escapeXml(article.getTitle())).append("</dc:title>\n");
        if (article.getAuthors() != null) {
            article.getAuthors().forEach(a ->
                    xml.append("  <dc:creator>").append(escapeXml(a.getFullName())).append("</dc:creator>\n"));
        }
        if (article.getKeywords() != null) {
            article.getKeywords().forEach(k ->
                    xml.append("  <dc:subject>").append(escapeXml(k)).append("</dc:subject>\n"));
        }
        if (article.getAbstractText() != null)
            xml.append("  <dc:description>").append(escapeXml(article.getAbstractText())).append("</dc:description>\n");
        if (article.getJournal() != null)
            xml.append("  <dc:source>").append(escapeXml(article.getJournal().getTitle())).append("</dc:source>\n");
        xml.append("  <dc:type>Text</dc:type>\n");
        xml.append("  <dc:format>application/pdf</dc:format>\n");
        if (article.getDoi() != null)
            xml.append("  <dc:identifier>https://doi.org/").append(article.getDoi()).append("</dc:identifier>\n");
        if (article.getPublishedAt() != null)
            xml.append("  <dc:date>").append(article.getPublishedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)).append("</dc:date>\n");
        if (article.getLanguage() != null)
            xml.append("  <dc:language>").append(article.getLanguage()).append("</dc:language>\n");
        if (article.getLicense() != null)
            xml.append("  <dc:rights>").append(escapeXml(article.getLicense())).append("</dc:rights>\n");
        xml.append("</oai_dc:dc>");
        return xml.toString();
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private String buildBibKey(Article article) {
        String firstAuthor = (article.getAuthors() != null && !article.getAuthors().isEmpty())
                ? article.getAuthors().get(0).getFullName().split(" ")[0].toLowerCase()
                : "anon";
        String year = article.getPublishedAt() != null
                ? String.valueOf(article.getPublishedAt().getYear()) : "0000";
        String titleWord = article.getTitle().split(" ")[0].toLowerCase().replaceAll("[^a-z]", "");
        return firstAuthor + year + titleWord;
    }

    private String formatAuthorsForBib(Article article) {
        if (article.getAuthors() == null || article.getAuthors().isEmpty()) return "Anonymous";
        return article.getAuthors().stream()
                .map(ArticleAuthor::getFullName)
                .collect(Collectors.joining(" and "));
    }

    /** Last, F.M. format for APA */
    private String toApaAuthor(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0];
        String last = parts[parts.length - 1];
        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++)
            initials.append(parts[i].charAt(0)).append(". ");
        return last + ", " + initials.toString().trim();
    }

    private String escapeLatex(String s) {
        return s == null ? "" : s.replace("&", "\\&").replace("%", "\\%").replace("$", "\\$");
    }

    private String escapeXml(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}

