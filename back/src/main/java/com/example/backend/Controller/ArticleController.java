package com.example.backend.Controller;

import com.example.backend.Entity.User;
import com.example.backend.Enums.ArticleStatus;
import com.example.backend.Payload.ApiResponse;
import com.example.backend.Payload.ArticleResponse;
import com.example.backend.Payload.ArticleSubmitRequest;
import com.example.backend.Services.ArticleService;
import com.example.backend.Services.MinioStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

/**
 * REST API for Article lifecycle management.
 *
 * Public:
 *   GET  /api/v1/articles                    – list published articles
 *   GET  /api/v1/articles/search             – full-text search
 *   GET  /api/v1/articles/{slug}             – get article by slug
 *   GET  /api/v1/articles/{id}/download      – download PDF (tracks download)
 *
 * Author:
 *   POST /api/v1/articles/submit             – submit new manuscript
 *   POST /api/v1/articles/{id}/pdf           – upload PDF file
 *   GET  /api/v1/articles/my                 – my submitted articles
 *
 * Editor/Admin:
 *   PUT  /api/v1/articles/{id}/status        – update workflow status
 *   PUT  /api/v1/articles/{id}/assign-issue  – assign to issue
 */
@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
@Tag(name = "Articles", description = "Article submission and publication API")
public class ArticleController {

    private final ArticleService articleService;
    private final MinioStorageService storageService;

    // ── Public ────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List all published articles")
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> list(
            @PageableDefault(size = 20, sort = "publishedAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(articleService.getPublished(pageable)));
    }

    @GetMapping("/search")
    @Operation(summary = "Full-text search across published articles")
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> search(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(articleService.search(q, pageable)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get article by SEO slug (increments view count)")
    public ResponseEntity<ApiResponse<ArticleResponse>> getBySlug(@PathVariable String slug) {
        ArticleResponse article = articleService.getBySlug(slug);
        articleService.trackView(article.getId());
        return ResponseEntity.ok(ApiResponse.ok(article));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ApiResponse<ArticleResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(articleService.getById(id)));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download article PDF and track download count")
    public void downloadPdf(@PathVariable UUID id, HttpServletResponse response) throws Exception {
        ArticleResponse article = articleService.getById(id);
        articleService.trackDownload(id);

        if (article.getPdfUrl() == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "PDF not available");
            return;
        }
        response.setContentType(MediaType.APPLICATION_PDF_VALUE);
        response.setHeader("Content-Disposition",
                "attachment; filename=\"" + id + ".pdf\"");
        // Redirect client to storage URL (MinIO presigned / local)
        response.sendRedirect(article.getPdfUrl());
    }

    @GetMapping(value = "/{id}/html", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Get full HTML rendering of the article")
    public ResponseEntity<String> getHtml(@PathVariable UUID id) {
        var entity = articleService.getEntity(id);
        if (entity.getHtmlContent() == null || entity.getHtmlContent().isBlank()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(entity.getHtmlContent());
    }

    // ── Journal-filtered list ─────────────────────────────────────────

    @GetMapping("/journal/{journalId}")
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> byJournal(
            @PathVariable UUID journalId,
            @RequestParam(defaultValue = "PUBLISHED") ArticleStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(articleService.getByJournal(journalId, status, pageable)));
    }

    // ── Author ────────────────────────────────────────────────────────

    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit a new article manuscript")
    public ResponseEntity<ApiResponse<ArticleResponse>> submit(
            @Valid @RequestBody ArticleSubmitRequest req,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Article submitted successfully.",
                articleService.submit(req, currentUser)));
    }

    @PostMapping(value = "/{id}/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload the article PDF file")
    public ResponseEntity<ApiResponse<ArticleResponse>> uploadPdf(
            @PathVariable UUID id,
            @RequestPart MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws Exception {
        return ResponseEntity.ok(ApiResponse.ok("PDF uploaded.",
                articleService.uploadPdf(id, file, currentUser)));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get articles submitted by the current user")
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> myArticles(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                articleService.getMyArticles(currentUser.getId(), pageable)));
    }

    // ── Editor / Admin ────────────────────────────────────────────────

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "Update article workflow status")
    public ResponseEntity<ApiResponse<ArticleResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam ArticleStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated.",
                articleService.updateStatus(id, status)));
    }

    @PutMapping("/{id}/assign-issue")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "Assign an accepted article to an issue")
    public ResponseEntity<ApiResponse<ArticleResponse>> assignToIssue(
            @PathVariable UUID id,
            @RequestParam UUID issueId) {
        return ResponseEntity.ok(ApiResponse.ok("Assigned to issue.",
                articleService.assignToIssue(id, issueId)));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "List all articles for editorial dashboard (any status)")
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> adminList(
            @RequestParam(required = false) UUID journalId,
            @RequestParam(defaultValue = "SUBMITTED") ArticleStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        if (journalId != null) {
            return ResponseEntity.ok(ApiResponse.ok(articleService.getByJournal(journalId, status, pageable)));
        }
        return ResponseEntity.ok(ApiResponse.ok(articleService.getPublished(pageable)));
    }
}

