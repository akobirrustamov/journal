package com.example.backend.Services;

import com.example.backend.Entity.EditorialBoardMember;
import com.example.backend.Entity.Journal;
import com.example.backend.Repository.EditorialBoardMemberRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EditorialBoardService {

    private final EditorialBoardMemberRepo repo;
    private final JournalService journalService;

    @Transactional(readOnly = true)
    public List<MemberResponse> getByJournal(UUID journalId) {
        return repo.findAllByJournalIdAndActiveTrueOrderByOrderIndexAsc(journalId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MemberResponse addMember(UUID journalId, MemberRequest req) {
        Journal journal = journalService.getEntity(journalId);
        EditorialBoardMember m = EditorialBoardMember.builder()
                .journal(journal)
                .fullName(req.getFullName())
                .email(req.getEmail())
                .orcid(req.getOrcid())
                .affiliation(req.getAffiliation())
                .country(req.getCountry())
                .position(req.getPosition())
                .bio(req.getBio())
                .photoUrl(req.getPhotoUrl())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 0)
                .active(true)
                .build();
        return toResponse(repo.save(m));
    }

    @Transactional
    public void removeMember(UUID memberId) {
        EditorialBoardMember m = repo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found: " + memberId));
        m.setActive(false);
        repo.save(m);
    }

    private MemberResponse toResponse(EditorialBoardMember m) {
        return MemberResponse.builder()
                .id(m.getId()).fullName(m.getFullName()).email(m.getEmail())
                .orcid(m.getOrcid()).affiliation(m.getAffiliation()).country(m.getCountry())
                .position(m.getPosition()).bio(m.getBio()).photoUrl(m.getPhotoUrl())
                .orderIndex(m.getOrderIndex()).build();
    }

    // ── Nested DTOs ────────────────────────────────────────────────────

    @Data
    public static class MemberRequest {
        private String fullName;
        private String email;
        private String orcid;
        private String affiliation;
        private String country;
        private String position;
        private String bio;
        private String photoUrl;
        private Integer orderIndex;
    }

    @Data @Builder
    public static class MemberResponse {
        private UUID id;
        private String fullName;
        private String email;
        private String orcid;
        private String affiliation;
        private String country;
        private String position;
        private String bio;
        private String photoUrl;
        private Integer orderIndex;
    }
}

