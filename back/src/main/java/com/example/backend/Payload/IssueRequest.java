package com.example.backend.Payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class IssueRequest {

    @NotNull(message = "Journal ID is required")
    private UUID journalId;

    private Integer volumeNumber;
    private Integer issueNumber;
    private String title;
    private String description;
    private LocalDate publishedDate;
    private boolean current;
    private String doi;
}

