package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/** A member of a journal's editorial board (editor-in-chief, associate editor, reviewer, etc.). */
@Entity
@Table(name = "editorial_board_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EditorialBoardMember {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_id", nullable = false)
    private Journal journal;

    /** Registered user in the system (optional) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String email;

    /** ORCID iD */
    private String orcid;

    private String affiliation;

    private String country;

    /** e.g. Editor-in-Chief, Associate Editor, Section Editor, Guest Editor */
    private String position;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url")
    private String photoUrl;

    /** Display order on editorial board page */
    @Builder.Default
    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;
}

