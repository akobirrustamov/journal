package com.example.backend.Controller;

import com.example.backend.Entity.User;
import com.example.backend.Payload.ApiResponse;
import com.example.backend.Payload.ReviewAssignRequest;
import com.example.backend.Payload.ReviewResponse;
import com.example.backend.Payload.ReviewSubmitRequest;
import com.example.backend.Services.ReviewService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST API for Peer Review workflow.
 *
 * Editor/Admin:
 *   POST PUT /api/v1/reviews/assign                 – assign reviewer
 *   GET      /api/v1/reviews/article/{articleId}    – all reviews for article
 *
 * Reviewer:
 *   PUT  /api/v1/reviews/{id}/respond               – accept or decline
 *   POST /api/v1/reviews/{id}/submit                – submit review
 *   POST /api/v1/reviews/{id}/files                 – upload reviewer file
 *   GET  /api/v1/reviews/my                         – reviewer dashboard
 *   GET  /api/v1/reviews/my/pending                 – pending invitations
 */
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Peer Review", description = "Peer review assignment and submission API")
public class ReviewController {

    private final ReviewService reviewService;

    // ── Editor/Admin ──────────────────────────────────────────────────

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "Assign a reviewer to an article")
    public ResponseEntity<ApiResponse<ReviewResponse>> assign(
            @Valid @RequestBody ReviewAssignRequest req,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Reviewer assigned.",
                reviewService.assign(req, currentUser)));
    }

    @GetMapping("/article/{articleId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','JOURNAL_ADMIN','EDITOR')")
    @Operation(summary = "Get all reviews for an article (editorial view)")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getByArticle(
            @PathVariable UUID articleId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getByArticle(articleId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a single review by ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getById(@PathVariable UUID id) {
        var review = reviewService.getEntity(id);
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getByArticle(review.getArticle().getId())
                .stream().filter(r -> r.getId().equals(id)).findFirst()
                .orElseThrow()));
    }

    // ── Reviewer ──────────────────────────────────────────────────────

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('REVIEWER','EDITOR','ADMIN','SUPERADMIN')")
    @Operation(summary = "Accept or decline a review invitation")
    public ResponseEntity<ApiResponse<ReviewResponse>> respond(
            @PathVariable UUID id,
            @RequestParam boolean accept,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                accept ? "Review invitation accepted." : "Review invitation declined.",
                reviewService.respondToInvitation(id, accept, currentUser)));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('REVIEWER','EDITOR','ADMIN','SUPERADMIN')")
    @Operation(summary = "Submit a completed peer review")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewSubmitRequest req,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Review submitted.",
                reviewService.submitReview(id, req, currentUser)));
    }

    @PostMapping(value = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('REVIEWER','EDITOR','ADMIN','SUPERADMIN')")
    @Operation(summary = "Upload a file attachment for a review")
    public ResponseEntity<ApiResponse<Void>> uploadFile(
            @PathVariable UUID id,
            @RequestPart MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws Exception {
        reviewService.uploadReviewFile(id, file, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("File uploaded.", null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('REVIEWER','EDITOR','ADMIN','SUPERADMIN')")
    @Operation(summary = "Get all reviews assigned to the current reviewer")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> myReviews(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                reviewService.getMyReviews(currentUser.getId(), pageable)));
    }

    @GetMapping("/my/pending")
    @PreAuthorize("hasAnyRole('REVIEWER','EDITOR','ADMIN','SUPERADMIN')")
    @Operation(summary = "Get pending review invitations for the current reviewer")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> myPendingReviews(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                reviewService.getMyPendingReviews(currentUser.getId(), pageable)));
    }
}

