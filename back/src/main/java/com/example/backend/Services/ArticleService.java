package com.example.backend.Services;

import com.example.backend.Entity.*;
import com.example.backend.Enums.ArticleStatus;
import com.example.backend.Payload.ArticleResponse;
import com.example.backend.Payload.ArticleSubmitRequest;
import com.example.backend.Repository.ArticleAuthorRepo;
import com.example.backend.Repository.ArticleRepo;
import com.example.backend.Repository.ReferenceRepo;
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
public class ArticleService {

    private final ArticleRepo articleRepo;
    private final ArticleAuthorRepo authorRepo;
    private final ReferenceRepo referenceRepo;
    private final com.example.backend.Repository.AttachmentRepo attachmentRepo;
    private final JournalService journalService;
    private final IssueService issueService;
    private final MinioStorageService storageService;
    private final SlugService slugService;
    private final DoiService doiService;
    private final EmailNotificationService emailService;

    // ── Submission ────────────────────────────────────────────────────

    @Transactional
    public ArticleResponse submit(ArticleSubmitRequest req, User submittedBy) {
        Journal journal = journalService.getEntity(req.getJournalId());

        String slug = generateUniqueSlug(req.getTitle());

        Article article = Article.builder()
                .title(req.getTitle())
                .slug(slug)
                .abstractText(req.getAbstractText())
                .keywords(req.getKeywords())
                .status(ArticleStatus.SUBMITTED)
                .journal(journal)
                .submittedBy(submittedBy)
                .reviewType(req.getReviewType())
                .language(req.getLanguage())
                .fundingInfo(req.getFundingInfo())
                .conflictOfInterest(req.getConflictOfInterest())
                .license(req.getLicense())
                .pageStart(req.getPageStart())
                .pageEnd(req.getPageEnd())
                .receivedDate(req.getReceivedDate())
                .metaTitle(req.getMetaTitle())
                .metaDescription(req.getMetaDescription())
                .build();

        article = articleRepo.save(article);

        // Persist authors
        if (req.getAuthors() != null) {
            final Article finalArticle = article;
            List<ArticleAuthor> authors = req.getAuthors().stream().map(a -> ArticleAuthor.builder()
                    .article(finalArticle)
                    .fullName(a.getFullName())
                    .email(a.getEmail())
                    .orcid(a.getOrcid())
                    .affiliation(a.getAffiliation())
                    .country(a.getCountry())
                    .corresponding(a.isCorresponding())
                    .orderIndex(a.getOrderIndex())
                    .build()).collect(Collectors.toList());
            authorRepo.saveAll(authors);
        }

        // Persist references
        if (req.getReferences() != null) {
            final Article finalArticle = article;
            List<Reference> refs = req.getReferences().stream().map(r -> Reference.builder()
                    .article(finalArticle)
                    .text(r.getText())
                    .doi(r.getDoi())
                    .url(r.getUrl())
                    .orderIndex(r.getOrderIndex())
                    .build()).collect(Collectors.toList());
            referenceRepo.saveAll(refs);
        }

        // Notify editors
        emailService.notifyArticleSubmitted(article);
        log.info("Article submitted: {} by {}", article.getId(), submittedBy.getUsername());

        return toResponse(article);
    }

    // ── Superadmin Reset ──────────────────────────────────────────────

    @Transactional
    public ArticleResponse reset(UUID articleId) {
        Article article = getEntity(articleId);
        article.setStatus(ArticleStatus.SUBMITTED);
        log.info("Article {} force-reset to SUBMITTED by superadmin", articleId);
        return toResponse(articleRepo.save(article));
    }

    // ── Admin Update ──────────────────────────────────────────────────

    @Transactional
    public ArticleResponse update(UUID articleId, ArticleSubmitRequest req) {
        Article article = getEntity(articleId);
        Journal journal = journalService.getEntity(req.getJournalId());

        article.setTitle(req.getTitle());
        article.setAbstractText(req.getAbstractText());
        article.setKeywords(req.getKeywords());
        article.setJournal(journal);
        article.setReviewType(req.getReviewType());
        article.setLanguage(req.getLanguage());
        article.setFundingInfo(req.getFundingInfo());
        article.setConflictOfInterest(req.getConflictOfInterest());
        article.setLicense(req.getLicense());
        article.setPageStart(req.getPageStart());
        article.setPageEnd(req.getPageEnd());
        article.setReceivedDate(req.getReceivedDate());
        article.setMetaTitle(req.getMetaTitle());
        article.setMetaDescription(req.getMetaDescription());

        // Replace authors
        authorRepo.deleteAll(article.getAuthors());
        article.getAuthors().clear();
        if (req.getAuthors() != null) {
            List<ArticleAuthor> authors = req.getAuthors().stream().map(a -> ArticleAuthor.builder()
                    .article(article)
                    .fullName(a.getFullName())
                    .email(a.getEmail())
                    .orcid(a.getOrcid())
                    .affiliation(a.getAffiliation())
                    .country(a.getCountry())
                    .corresponding(a.isCorresponding())
                    .orderIndex(a.getOrderIndex())
                    .build()).collect(Collectors.toList());
            authorRepo.saveAll(authors);
        }

        // Replace references
        referenceRepo.deleteAll(article.getReferences());
        article.getReferences().clear();
        if (req.getReferences() != null) {
            List<Reference> refs = req.getReferences().stream().map(r -> Reference.builder()
                    .article(article)
                    .text(r.getText())
                    .doi(r.getDoi())
                    .url(r.getUrl())
                    .orderIndex(r.getOrderIndex())
                    .build()).collect(Collectors.toList());
            referenceRepo.saveAll(refs);
        }

        return toResponse(articleRepo.save(article));
    }

    // ── PDF Upload ────────────────────────────────────────────────────

    @Transactional
    public ArticleResponse uploadPdf(UUID articleId, MultipartFile pdfFile, User currentUser) throws Exception {
        Article article = getEntity(articleId);
        Attachment attachment = Attachment.createAttachment(pdfFile, "/articles");
        attachment = attachmentRepo.save(attachment);
        article.setPdfFile(attachment);
        return toResponse(articleRepo.save(article));
    }

    // ── Status Workflow ───────────────────────────────────────────────

    @Transactional
    public ArticleResponse updateStatus(UUID articleId, ArticleStatus newStatus) {
        Article article = getEntity(articleId);
        ArticleStatus old = article.getStatus();

        if (old == newStatus) return toResponse(article);
        validateTransition(old, newStatus);
        article.setStatus(newStatus);

        article.getAuthors().size(); // initialize lazy collection before async email
        if (newStatus == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
            // Generate DOI if not already assigned
            if (article.getDoi() == null) {
                String doi = doiService.generateArticleDoi(article);
                article.setDoi(doi);
                doiService.registerWithCrossRef(article);
            }
            emailService.notifyArticlePublished(article);
        } else if (newStatus == ArticleStatus.ACCEPTED) {
            emailService.notifyArticleAccepted(article);
        } else if (newStatus == ArticleStatus.REJECTED) {
            emailService.notifyArticleRejected(article);
        } else if (newStatus == ArticleStatus.REVISION_REQUIRED) {
            emailService.notifyRevisionRequired(article);
        }

        return toResponse(articleRepo.save(article));
    }

    @Transactional
    public ArticleResponse assignToIssue(UUID articleId, UUID issueId) {
        Article article = getEntity(articleId);
        Issue issue = issueService.getEntity(issueId);
        article.setIssue(issue);
        return toResponse(articleRepo.save(article));
    }

    // ── Statistics ────────────────────────────────────────────────────

    @Transactional
    public void trackView(UUID articleId) {
        articleRepo.incrementViewCount(articleId);
    }

    @Transactional
    public void trackDownload(UUID articleId) {
        articleRepo.incrementDownloadCount(articleId);
    }

    // ── Queries ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getPublished(Pageable pageable) {
        return articleRepo.findAllByStatus(ArticleStatus.PUBLISHED, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getAdminList(UUID journalId, ArticleStatus status, Pageable pageable) {
        if (journalId != null && status != null) {
            return articleRepo.findAllByJournalIdAndStatus(journalId, status, pageable).map(this::toResponse);
        } else if (journalId != null) {
            return articleRepo.findAllByJournalId(journalId, pageable).map(this::toResponse);
        } else if (status != null) {
            return articleRepo.findAllByStatus(status, pageable).map(this::toResponse);
        } else {
            return articleRepo.findAll(pageable).map(this::toResponse);
        }
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getByJournal(UUID journalId, ArticleStatus status, Pageable pageable) {
        return articleRepo.findAllByJournalIdAndStatus(journalId, status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getByIssue(UUID issueId, Pageable pageable) {
        return articleRepo.findAllByIssueId(issueId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getMyArticles(UUID userId, Pageable pageable) {
        return articleRepo.findAllBySubmittedById(userId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ArticleResponse getBySlug(String slug) {
        return articleRepo.findBySlug(slug)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Article not found: " + slug));
    }

    @Transactional(readOnly = true)
    public ArticleResponse getById(UUID id) {
        return toResponse(getEntity(id));
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> search(String query, Pageable pageable) {
        return articleRepo.searchPublished(query, pageable).map(this::toResponse);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    public Article getEntity(UUID id) {
        return articleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Article not found: " + id));
    }

    private String generateUniqueSlug(String title) {
        String base = slugService.toSlug(title);
        String candidate = base;
        int counter = 2;
        while (articleRepo.existsBySlug(candidate)) {
            candidate = base + "-" + counter++;
        }
        return candidate;
    }

    /**
     * Enforce valid workflow state transitions.
     * Prevents e.g. going from PUBLISHED back to SUBMITTED.
     */
    private void validateTransition(ArticleStatus from, ArticleStatus to) {
        boolean valid = switch (from) {
            case DRAFT             -> to == ArticleStatus.SUBMITTED;
            case SUBMITTED         -> to == ArticleStatus.UNDER_REVIEW || to == ArticleStatus.REJECTED;
            case UNDER_REVIEW      -> to == ArticleStatus.REVISION_REQUIRED
                                   || to == ArticleStatus.ACCEPTED
                                   || to == ArticleStatus.REJECTED;
            case REVISION_REQUIRED -> to == ArticleStatus.SUBMITTED || to == ArticleStatus.REJECTED;
            case ACCEPTED          -> to == ArticleStatus.PUBLISHED || to == ArticleStatus.REJECTED;
            case PUBLISHED         -> to == ArticleStatus.ARCHIVED;
            case ARCHIVED, REJECTED -> false;
        };
        if (!valid) {
            throw new IllegalStateException(
                "Invalid status transition from " + from + " to " + to);
        }
    }

    public ArticleResponse toResponse(Article a) {
        List<ArticleResponse.AuthorSummary> authorSummaries =
                a.getAuthors() == null ? List.of() :
                a.getAuthors().stream().map(au -> ArticleResponse.AuthorSummary.builder()
                        .fullName(au.getFullName())
                        .orcid(au.getOrcid())
                        .affiliation(au.getAffiliation())
                        .corresponding(au.isCorresponding())
                        .orderIndex(au.getOrderIndex())
                        .build()).collect(Collectors.toList());

        List<ArticleResponse.ReferenceSummary> referenceSummaries =
                a.getReferences() == null ? List.of() :
                a.getReferences().stream().map(r -> ArticleResponse.ReferenceSummary.builder()
                        .text(r.getText())
                        .doi(r.getDoi())
                        .url(r.getUrl())
                        .orderIndex(r.getOrderIndex())
                        .build()).collect(Collectors.toList());

        return ArticleResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .slug(a.getSlug())
                .abstractText(a.getAbstractText())
                .keywords(a.getKeywords())
                .status(a.getStatus())
                .doi(a.getDoi())
                .journalId(a.getJournal() != null ? a.getJournal().getId() : null)
                .journalTitle(a.getJournal() != null ? a.getJournal().getTitle() : null)
                .journalSlug(a.getJournal() != null ? a.getJournal().getSlug() : null)
                .issueId(a.getIssue() != null ? a.getIssue().getId() : null)
                .volumeNumber(a.getIssue() != null ? a.getIssue().getVolumeNumber() : null)
                .issueNumber(a.getIssue() != null ? a.getIssue().getIssueNumber() : null)
                .pdfUrl(a.getPdfFile() != null ? storageService.resolveUrl(a.getPdfFile()) : null)
                .hasHtml(a.getHtmlContent() != null && !a.getHtmlContent().isBlank())
                .authors(authorSummaries)
                .references(referenceSummaries)
                .reviewType(a.getReviewType())
                .pageStart(a.getPageStart())
                .pageEnd(a.getPageEnd())
                .language(a.getLanguage())
                .license(a.getLicense())
                .receivedDate(a.getReceivedDate())
                .acceptedDate(a.getAcceptedDate())
                .submittedAt(a.getSubmittedAt())
                .publishedAt(a.getPublishedAt())
                .metaTitle(a.getMetaTitle())
                .metaDescription(a.getMetaDescription())
                .viewCount(a.getViewCount())
                .downloadCount(a.getDownloadCount())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

