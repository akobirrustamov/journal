package com.example.backend.Controller;

import com.example.backend.Payload.ApiResponse;
import com.example.backend.Payload.IssueRequest;
import com.example.backend.Payload.IssueResponse;
import com.example.backend.Services.ArticleService;
import com.example.backend.Services.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * REST API for Issue management.
 *
 * Public:
 *   GET  /api/v1/issues/{id}               – get issue details
 *   GET  /api/v1/issues/{id}/articles      – list published articles in issue
 *
 * Admin:
 *   POST /api/v1/issues                    – create issue
 *   PUT  /api/v1/issues/{id}               – update issue
 *   POST /api/v1/issues/{id}/cover         – upload cover image
 */
@RestController
@RequestMapping("/api/v1/issues")
@RequiredArgsConstructor
@Tag(name = "Issues", description = "Journal issue management API")
public class IssueController {

    private final IssueService issueService;
    private final ArticleService articleService;

    @GetMapping("/{id}")
    @Operation(summary = "Get issue by ID")
    public ResponseEntity<ApiResponse<IssueResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(issueService.getById(id)));
    }

    @GetMapping("/{id}/articles")
    @Operation(summary = "List published articles in an issue")
    public ResponseEntity<ApiResponse<?>> getArticles(
            @PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(articleService.getByIssue(id, pageable)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "Create a new issue")
    public ResponseEntity<ApiResponse<IssueResponse>> create(@Valid @RequestBody IssueRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Issue created.", issueService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "Update issue metadata")
    public ResponseEntity<ApiResponse<IssueResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody IssueRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Issue updated.", issueService.update(id, req)));
    }

    @PostMapping(value = "/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "Upload issue cover image")
    public ResponseEntity<ApiResponse<Void>> uploadCover(
            @PathVariable UUID id,
            @RequestPart MultipartFile file) throws Exception {
        issueService.uploadCover(id, file);
        return ResponseEntity.ok(ApiResponse.ok("Cover uploaded.", null));
    }
}

