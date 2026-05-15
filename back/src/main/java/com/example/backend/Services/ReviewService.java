package com.example.backend.Services;

import com.example.backend.Entity.*;
import com.example.backend.Enums.ArticleStatus;
import com.example.backend.Enums.ReviewStatus;
import com.example.backend.Payload.ReviewAssignRequest;
import com.example.backend.Payload.ReviewResponse;
import com.example.backend.Payload.ReviewSubmitRequest;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.ReviewRepo;
import com.example.backend.Repository.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepo reviewRepo;
    private final ArticleService articleService;
    private final UserRepo userRepo;
    private final AttachmentRepo attachmentRepo;
    private final MinioStorageService storageService;
    private final EmailNotificationService emailService;

    // ── Assignment ────────────────────────────────────────────────────

    @Transactional
    public ReviewResponse assign(ReviewAssignRequest req, User assignedBy) {
        Article article = articleService.getEntity(req.getArticleId());
        User reviewer = userRepo.findById(req.getReviewerId())
                .orElseThrow(() -> new EntityNotFoundException("Reviewer not found: " + req.getReviewerId()));

        if (reviewRepo.existsByArticleIdAndReviewerId(article.getId(), reviewer.getId())) {
            throw new IllegalArgumentException("Reviewer " + reviewer.getName() + " is already assigned to this article.");
        }

        Review review = Review.builder()
                .article(article)
                .reviewer(reviewer)
                .assignedBy(assignedBy)
                .status(ReviewStatus.PENDING)
                .dueDate(req.getDueDate())
                .build();

        review = reviewRepo.save(review);

        // Move article to UNDER_REVIEW
        if (article.getStatus() == ArticleStatus.SUBMITTED) {
            articleService.updateStatus(article.getId(), ArticleStatus.UNDER_REVIEW);
        }

        emailService.notifyReviewerInvited(review);
        log.info("Review assigned: article={} reviewer={}", article.getId(), reviewer.getId());
        return toResponse(review);
    }

    // ── Reviewer Response ─────────────────────────────────────────────

    @Transactional
    public ReviewResponse respondToInvitation(UUID reviewId, boolean accept, User reviewer) {
        Review review = getEntity(reviewId);

        if (!review.getReviewer().getId().equals(reviewer.getId())) {
            throw new SecurityException("You are not assigned to this review.");
        }
        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new IllegalStateException("Review invitation is no longer pending.");
        }

        review.setStatus(accept ? ReviewStatus.ACCEPTED : ReviewStatus.DECLINED);
        review.setRespondedAt(LocalDateTime.now());

        reviewRepo.save(review);
        emailService.notifyReviewerResponse(review, accept);
        return toResponse(review);
    }

    // ── Submit Review ─────────────────────────────────────────────────

    @Transactional
    public ReviewResponse submitReview(UUID reviewId, ReviewSubmitRequest req, User reviewer) {
        Review review = getEntity(reviewId);

        if (!review.getReviewer().getId().equals(reviewer.getId())) {
            throw new SecurityException("You are not assigned to this review.");
        }
        if (review.getStatus() != ReviewStatus.ACCEPTED) {
            throw new IllegalStateException("You must accept the review invitation before submitting.");
        }

        review.setDecision(req.getDecision());
        review.setCommentsForAuthor(req.getCommentsForAuthor());
        review.setCommentsForEditor(req.getCommentsForEditor());
        review.setScore(req.getScore());
        review.setScoreOriginality(req.getScoreOriginality());
        review.setScoreMethodology(req.getScoreMethodology());
        review.setScoreClarity(req.getScoreClarity());
        review.setStatus(ReviewStatus.COMPLETED);
        review.setCompletedAt(LocalDateTime.now());

        reviewRepo.save(review);

        // Check if all reviewers have completed → notify editor
        List<Review> allReviews = reviewRepo.findAllByArticleId(review.getArticle().getId());
        boolean allComplete = allReviews.stream()
                .allMatch(r -> r.getStatus() == ReviewStatus.COMPLETED || r.getStatus() == ReviewStatus.DECLINED);
        if (allComplete) {
            emailService.notifyAllReviewsComplete(review.getArticle());
        }

        return toResponse(review);
    }

    // ── File Upload ───────────────────────────────────────────────────

    @Transactional
    public void uploadReviewFile(UUID reviewId, MultipartFile file, User reviewer) throws Exception {
        Review review = getEntity(reviewId);
        if (!review.getReviewer().getId().equals(reviewer.getId())) {
            throw new SecurityException("You are not assigned to this review.");
        }
        Attachment attachment = storageService.uploadReviewFile(file);
        ReviewFile reviewFile = ReviewFile.builder()
                .review(review)
                .attachment(attachment)
                .build();
        review.getFiles().add(reviewFile);
        reviewRepo.save(review);
    }

    // ── Queries ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReviewResponse> getByArticle(UUID articleId) {
        return reviewRepo.findAllByArticleId(articleId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(UUID reviewerId, Pageable pageable) {
        return reviewRepo.findAllByReviewerId(reviewerId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyPendingReviews(UUID reviewerId, Pageable pageable) {
        return reviewRepo.findAllByReviewerIdAndStatus(reviewerId, ReviewStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    public Review getEntity(UUID id) {
        return reviewRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found: " + id));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .articleId(r.getArticle().getId())
                .articleTitle(r.getArticle().getTitle())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getName())
                .status(r.getStatus())
                .decision(r.getDecision())
                .commentsForAuthor(r.getCommentsForAuthor())
                .commentsForEditor(r.getCommentsForEditor())
                .score(r.getScore())
                .scoreOriginality(r.getScoreOriginality())
                .scoreMethodology(r.getScoreMethodology())
                .scoreClarity(r.getScoreClarity())
                .dueDate(r.getDueDate())
                .invitedAt(r.getInvitedAt())
                .respondedAt(r.getRespondedAt())
                .completedAt(r.getCompletedAt())
                .build();
    }
}

