package com.example.backend.Repository;

import com.example.backend.Entity.EditorialBoardMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EditorialBoardMemberRepo extends JpaRepository<EditorialBoardMember, UUID> {
    List<EditorialBoardMember> findAllByJournalIdAndActiveTrueOrderByOrderIndexAsc(UUID journalId);
}

