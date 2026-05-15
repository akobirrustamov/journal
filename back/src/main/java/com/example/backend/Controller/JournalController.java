package com.example.backend.Controller;

import com.example.backend.Payload.ApiResponse;
import com.example.backend.Payload.JournalRequest;
import com.example.backend.Payload.JournalResponse;
import com.example.backend.Services.EditorialBoardService;
import com.example.backend.Services.IssueService;
import com.example.backend.Services.JournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * REST API for Journal management.
 *
 * Public endpoints:
 *   GET /api/v1/journals          – list all active journals (paginated)
 *   GET /api/v1/journals/search   – full-text search
 *   GET /api/v1/journals/{slug}   – get journal by SEO slug
 *   GET /api/v1/journals/{id}/issues     – list issues for journal
 *   GET /api/v1/journals/{id}/issues/current – current issue
 *
 * Admin endpoints (require ROLE_ADMIN or ROLE_JOURNAL_ADMIN):
 *   POST   /api/v1/journals        – create journal
 *   PUT    /api/v1/journals/{id}   – update journal
 *   DELETE /api/v1/journals/{id}   – deactivate journal
 *   POST   /api/v1/journals/{id}/cover – upload cover image
 */
@RestController
@RequestMapping("/api/v1/journals")
@RequiredArgsConstructor
@Tag(name = "Journals", description = "Journal management API")
public class JournalController {

    private final JournalService journalService;
    private final IssueService issueService;
    private final EditorialBoardService editorialBoardService;

    // ── Public ────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List all active journals")
    public ResponseEntity<ApiResponse<Page<JournalResponse>>> list(
            @PageableDefault(size = 20, sort = "title") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(journalService.getAll(pageable)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search journals by title or description")
    public ResponseEntity<ApiResponse<Page<JournalResponse>>> search(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(journalService.search(q, pageable)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get journal by slug")
    public ResponseEntity<ApiResponse<JournalResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(journalService.getBySlug(slug)));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ApiResponse<JournalResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(journalService.getById(id)));
    }

    @GetMapping("/{id}/issues")
    @Operation(summary = "List all issues of a journal")
    public ResponseEntity<ApiResponse<?>> getIssues(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(issueService.getByJournal(id)));
    }

    @GetMapping("/{id}/issues/current")
    @Operation(summary = "Get the current issue of a journal")
    public ResponseEntity<ApiResponse<?>> getCurrentIssue(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(issueService.getCurrentIssue(id)));
    }

    // ── Admin/Editor ──────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN')")
    @Operation(summary = "Create a new journal")
    public ResponseEntity<ApiResponse<JournalResponse>> create(@Valid @RequestBody JournalRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Journal created successfully.", journalService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN')")
    @Operation(summary = "Update journal metadata")
    public ResponseEntity<ApiResponse<JournalResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody JournalRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Journal updated.", journalService.update(id, req)));
    }

    @PostMapping(value = "/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN')")
    @Operation(summary = "Upload journal cover image")
    public ResponseEntity<ApiResponse<Void>> uploadCover(
            @PathVariable UUID id,
            @RequestPart MultipartFile file) throws Exception {
        journalService.uploadCoverImage(id, file);
        return ResponseEntity.ok(ApiResponse.ok("Cover image uploaded.", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    @Operation(summary = "Deactivate a journal")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        journalService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.ok("Journal deactivated.", null));
    }

    // ── Editorial Board ───────────────────────────────────────────────

    @GetMapping("/{id}/board")
    @Operation(summary = "Get editorial board members for a journal")
    public ResponseEntity<ApiResponse<?>> getBoard(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(editorialBoardService.getByJournal(id)));
    }

    @PostMapping("/{id}/board")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN')")
    @Operation(summary = "Add a member to the editorial board")
    public ResponseEntity<ApiResponse<?>> addBoardMember(
            @PathVariable UUID id,
            @RequestBody EditorialBoardService.MemberRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Member added.", editorialBoardService.addMember(id, req)));
    }

    @DeleteMapping("/board/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN')")
    @Operation(summary = "Remove a member from the editorial board")
    public ResponseEntity<ApiResponse<Void>> removeBoardMember(@PathVariable UUID memberId) {
        editorialBoardService.removeMember(memberId);
        return ResponseEntity.ok(ApiResponse.ok("Member removed.", null));
    }
}



