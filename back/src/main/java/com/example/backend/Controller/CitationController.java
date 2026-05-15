package com.example.backend.Controller;

import com.example.backend.Services.ArticleService;
import com.example.backend.Services.CitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API for exporting article citations in academic formats.
 *
 * GET /api/v1/citations/{articleId}/bibtex       – BibTeX format
 * GET /api/v1/citations/{articleId}/ris          – RIS format (Zotero, Mendeley)
 * GET /api/v1/citations/{articleId}/apa          – APA 7th edition
 * GET /api/v1/citations/{articleId}/mla          – MLA 9th edition
 * GET /api/v1/citations/{articleId}/dublin-core  – Dublin Core XML
 */
@RestController
@RequestMapping("/api/v1/citations")
@RequiredArgsConstructor
@Tag(name = "Citations", description = "Citation export in BibTeX, RIS, APA, MLA, Dublin Core")
public class CitationController {

    private final CitationService citationService;
    private final ArticleService articleService;

    @GetMapping("/{articleId}/bibtex")
    @Operation(summary = "Export BibTeX citation")
    public ResponseEntity<String> bibtex(@PathVariable UUID articleId) {
        var article = articleService.getEntity(articleId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/x-bibtex"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + article.getSlug() + ".bib\"")
                .body(citationService.toBibTeX(article));
    }

    @GetMapping("/{articleId}/ris")
    @Operation(summary = "Export RIS citation (Zotero / Mendeley compatible)")
    public ResponseEntity<String> ris(@PathVariable UUID articleId) {
        var article = articleService.getEntity(articleId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/x-research-info-systems"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + article.getSlug() + ".ris\"")
                .body(citationService.toRIS(article));
    }

    @GetMapping(value = "/{articleId}/apa", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Export APA 7th edition citation (HTML)")
    public ResponseEntity<String> apa(@PathVariable UUID articleId) {
        var article = articleService.getEntity(articleId);
        return ResponseEntity.ok(citationService.toAPA(article));
    }

    @GetMapping(value = "/{articleId}/mla", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Export MLA 9th edition citation (HTML)")
    public ResponseEntity<String> mla(@PathVariable UUID articleId) {
        var article = articleService.getEntity(articleId);
        return ResponseEntity.ok(citationService.toMLA(article));
    }

    @GetMapping(value = "/{articleId}/dublin-core", produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "Export Dublin Core XML metadata")
    public ResponseEntity<String> dublinCore(@PathVariable UUID articleId) {
        var article = articleService.getEntity(articleId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(citationService.toDublinCoreXml(article));
    }
}

