package com.example.backend.Services;

import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Issue;
import com.example.backend.Entity.Journal;
import com.example.backend.Payload.JournalRequest;
import com.example.backend.Payload.JournalResponse;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.IssueRepo;
import com.example.backend.Repository.JournalRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JournalService {

    private final JournalRepo journalRepo;
    private final IssueRepo issueRepo;
    private final AttachmentRepo attachmentRepo;
    private final SlugService slugService;
    private final MinioStorageService storageService;

    // ── CRUD ──────────────────────────────────────────────────────────

    @Transactional
    public JournalResponse create(
            JournalRequest req
    ) {

        Journal journal = Journal.builder()

                .title(req.getTitle())
                .titleAbbr(req.getTitleAbbr())
                .issnPrint(req.getIssnPrint())
                .issnOnline(req.getIssnOnline())
                .isbn(req.getIsbn())
                .doi(req.getDoi())
                .description(req.getDescription())
                .shortDescription(req.getShortDescription())
                .publicationFrequency(
                        req.getPublicationFrequency()
                )
                .foundedYear(req.getFoundedYear())
                .publisher(req.getPublisher())
                .language(req.getLanguage())
                .country(req.getCountry())
                .scope(req.getScope())
                .metaTitle(req.getMetaTitle())
                .metaDescription(
                        req.getMetaDescription()
                )
                .metaKeywords(req.getMetaKeywords())
                .openAccess(req.isOpenAccess())
                .website(req.getWebsite())
                .email(req.getEmail())
                .phone(req.getPhone())
                .license(req.getLicense())
                .active(true)
                .build();

        return toResponse(
                journalRepo.save(journal)
        );
    }
    @Transactional
    public JournalResponse update(
            UUID id,
            JournalRequest req
    ) {

        Journal journal = getEntity(id);

        if (req.getTitle() != null)
            journal.setTitle(req.getTitle());

        if (req.getTitleAbbr() != null)
            journal.setTitleAbbr(req.getTitleAbbr());

        if (req.getIssnPrint() != null)
            journal.setIssnPrint(req.getIssnPrint());

        if (req.getIssnOnline() != null)
            journal.setIssnOnline(req.getIssnOnline());

        if (req.getIsbn() != null)
            journal.setIsbn(req.getIsbn());

        if (req.getDescription() != null)
            journal.setDescription(req.getDescription());

        if (req.getShortDescription() != null)
            journal.setShortDescription(req.getShortDescription());

        if (req.getPublicationFrequency() != null)
            journal.setPublicationFrequency(
                    req.getPublicationFrequency()
            );

        if (req.getFoundedYear() != null)
            journal.setFoundedYear(
                    req.getFoundedYear()
            );

        if (req.getPublisher() != null)
            journal.setPublisher(req.getPublisher());

        if (req.getLanguage() != null)
            journal.setLanguage(req.getLanguage());

        if (req.getCountry() != null)
            journal.setCountry(req.getCountry());

        if (req.getScope() != null)
            journal.setScope(req.getScope());

        if (req.getMetaTitle() != null)
            journal.setMetaTitle(req.getMetaTitle());

        if (req.getMetaDescription() != null)
            journal.setMetaDescription(
                    req.getMetaDescription()
            );

        if (req.getMetaKeywords() != null)
            journal.setMetaKeywords(
                    req.getMetaKeywords()
            );

        if (req.getWebsite() != null)
            journal.setWebsite(req.getWebsite());

        if (req.getEmail() != null)
            journal.setEmail(req.getEmail());

        if (req.getPhone() != null)
            journal.setPhone(req.getPhone());

        if (req.getLicense() != null)
            journal.setLicense(req.getLicense());

        return toResponse(
                journalRepo.save(journal)
        );
    }

    @Transactional
    public void uploadCoverImage(
            UUID id,
            MultipartFile file
    ) throws Exception {

        Journal journal = getEntity(id);

        Attachment cover =
                Attachment.createAttachment(
                        file,
                        "/journals"
                );

        // SAVE ATTACHMENT FIRST
        cover = attachmentRepo.save(cover);

        // SET TO JOURNAL
        journal.setCoverImage(cover);

        // SAVE JOURNAL
        journalRepo.save(journal);
    }

    @Transactional
    public void deactivate(UUID id) {
        Journal journal = getEntity(id);
        journal.setActive(false);
        journalRepo.save(journal);
    }

    // ── Queries ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<JournalResponse> getAll(Pageable pageable) {
        return journalRepo.findAllByActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public JournalResponse getById(UUID id) {
        return toResponse(getEntity(id));
    }

    @Transactional(readOnly = true)
    public JournalResponse getBySlug(String slug) {
        Journal journal = journalRepo.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Journal not found: " + slug));
        return toResponse(journal);
    }

    @Transactional(readOnly = true)
    public Page<JournalResponse> search(String query, Pageable pageable) {
        return journalRepo.search(query, pageable).map(this::toResponse);
    }

    // ── Helper ────────────────────────────────────────────────────────

    public Journal getEntity(UUID id) {
        return journalRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Journal not found: " + id));
    }

    public JournalResponse toResponse(Journal j) {
        int totalArticles = j.getIssues() == null ? 0 :
                j.getIssues().stream().mapToInt(i -> i.getArticles() == null ? 0 : i.getArticles().size()).sum();

        return JournalResponse.builder()
                .id(j.getId())
                .title(j.getTitle())
                .titleAbbr(j.getTitleAbbr())
                .slug(j.getSlug())
                .issnPrint(j.getIssnPrint())
                .issnOnline(j.getIssnOnline())
                .isbn(j.getIsbn())
                .doi(j.getDoi())
                .description(j.getDescription())
                .shortDescription(j.getShortDescription())
                .coverImageUrl(j.getCoverImage() != null ? storageService.resolveUrl(j.getCoverImage()) : null)
                .publicationFrequency(j.getPublicationFrequency())
                .foundedYear(j.getFoundedYear())
                .publisher(j.getPublisher())
                .language(j.getLanguage())
                .country(j.getCountry())
                .scope(j.getScope())
                .metaTitle(j.getMetaTitle())
                .metaDescription(j.getMetaDescription())
                .metaKeywords(j.getMetaKeywords())
                .openAccess(j.isOpenAccess())
                .website(j.getWebsite())
                .email(j.getEmail())
                .license(j.getLicense())
                .active(j.isActive())
                .createdAt(j.getCreatedAt())
                .updatedAt(j.getUpdatedAt())
                .totalIssues(j.getIssues() != null ? j.getIssues().size() : 0)
                .totalArticles(totalArticles)
                .build();
    }
}

