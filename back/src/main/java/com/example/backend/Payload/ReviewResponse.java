package com.example.backend.Payload;

import com.example.backend.Enums.ReviewDecision;
import com.example.backend.Enums.ReviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID articleId;
    private String articleTitle;
    private UUID reviewerId;
    private String reviewerName;
    private ReviewStatus status;
    private ReviewDecision decision;
    private String commentsForAuthor;
    private String commentsForEditor;
    private Integer score;
    private Integer scoreOriginality;
    private Integer scoreMethodology;
    private Integer scoreClarity;
    private LocalDate dueDate;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime completedAt;
}

