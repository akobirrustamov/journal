package com.example.backend.Services;

import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Issue;
import com.example.backend.Entity.Journal;
import com.example.backend.Payload.IssueRequest;
import com.example.backend.Payload.IssueResponse;
import com.example.backend.Repository.IssueRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IssueService {

    private final IssueRepo issueRepo;
    private final JournalService journalService;
    private final MinioStorageService storageService;

    @Transactional
    public IssueResponse create(IssueRequest req) {
        Journal journal = journalService.getEntity(req.getJournalId());

        if (issueRepo.existsByJournalIdAndVolumeNumberAndIssueNumber(
                journal.getId(), req.getVolumeNumber(), req.getIssueNumber())) {
            throw new IllegalArgumentException(
                "Issue Vol." + req.getVolumeNumber() + " No." + req.getIssueNumber() + " already exists.");
        }

        // If marking as current, unset any existing current issue
        if (req.isCurrent()) {
            issueRepo.findByJournalIdAndCurrentTrue(journal.getId())
                    .ifPresent(existing -> {
                        existing.setCurrent(false);
                        issueRepo.save(existing);
                    });
        }

        Issue issue = Issue.builder()
                .journal(journal)
                .volumeNumber(req.getVolumeNumber())
                .issueNumber(req.getIssueNumber())
                .title(req.getTitle())
                .description(req.getDescription())
                .publishedDate(req.getPublishedDate())
                .current(req.isCurrent())
                .doi(req.getDoi())
                .build();

        return toResponse(issueRepo.save(issue));
    }

    @Transactional
    public IssueResponse update(UUID id, IssueRequest req) {
        Issue issue = getEntity(id);
        if (req.getTitle() != null) issue.setTitle(req.getTitle());
        if (req.getDescription() != null) issue.setDescription(req.getDescription());
        if (req.getPublishedDate() != null) issue.setPublishedDate(req.getPublishedDate());
        if (req.getDoi() != null) issue.setDoi(req.getDoi());

        if (req.isCurrent() && !issue.isCurrent()) {
            issueRepo.findByJournalIdAndCurrentTrue(issue.getJournal().getId())
                    .filter(e -> !e.getId().equals(id))
                    .ifPresent(existing -> {
                        existing.setCurrent(false);
                        issueRepo.save(existing);
                    });
            issue.setCurrent(true);
        }

        return toResponse(issueRepo.save(issue));
    }

    @Transactional
    public void uploadCover(UUID id, MultipartFile file) throws Exception {
        Issue issue = getEntity(id);
        Attachment cover = storageService.uploadJournalCover(file);
        issue.setCoverImage(cover);
        issueRepo.save(issue);
    }

    @Transactional(readOnly = true)
    public IssueResponse getById(UUID id) {
        return toResponse(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getByJournal(UUID journalId) {
        return issueRepo.findAllByJournalIdOrderByVolumeNumberDescIssueNumberDesc(journalId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueResponse getCurrentIssue(UUID journalId) {
        return issueRepo.findByJournalIdAndCurrentTrue(journalId)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("No current issue for journal: " + journalId));
    }

    public Issue getEntity(UUID id) {
        return issueRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found: " + id));
    }

    public IssueResponse toResponse(Issue i) {
        return IssueResponse.builder()
                .id(i.getId())
                .journalId(i.getJournal().getId())
                .journalTitle(i.getJournal().getTitle())
                .volumeNumber(i.getVolumeNumber())
                .issueNumber(i.getIssueNumber())
                .title(i.getTitle())
                .description(i.getDescription())
                .publishedDate(i.getPublishedDate())
                .current(i.isCurrent())
                .doi(i.getDoi())
                .coverImageUrl(i.getCoverImage() != null ? storageService.resolveUrl(i.getCoverImage()) : null)
                .articleCount(i.getArticles() != null ? i.getArticles().size() : 0)
                .createdAt(i.getCreatedAt())
                .build();
    }
}

