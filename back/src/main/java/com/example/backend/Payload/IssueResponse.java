package com.example.backend.Payload;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class IssueResponse {
    private UUID id;
    private UUID journalId;
    private String journalTitle;
    private Integer volumeNumber;
    private Integer issueNumber;
    private String title;
    private String description;
    private LocalDate publishedDate;
    private boolean current;
    private String doi;
    private String coverImageUrl;
    private int articleCount;
    private LocalDateTime createdAt;
}

