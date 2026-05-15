package com.example.backend.Repository;

import com.example.backend.Entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IssueRepo extends JpaRepository<Issue, UUID> {

    List<Issue> findAllByJournalIdOrderByVolumeNumberDescIssueNumberDesc(UUID journalId);

    Optional<Issue> findByJournalIdAndCurrentTrue(UUID journalId);

    Optional<Issue> findByJournalIdAndVolumeNumberAndIssueNumber(
            UUID journalId, Integer volumeNumber, Integer issueNumber);

    boolean existsByJournalIdAndVolumeNumberAndIssueNumber(
            UUID journalId, Integer volumeNumber, Integer issueNumber);
}

