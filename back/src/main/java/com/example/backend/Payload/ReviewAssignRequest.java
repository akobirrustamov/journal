package com.example.backend.Payload;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/** Request DTO for assigning a reviewer to an article. */
@Data
public class ReviewAssignRequest {

    @NotNull(message = "Article ID is required")
    private UUID articleId;

    @NotNull(message = "Reviewer ID is required")
    private UUID reviewerId;

    @Future(message = "Due date must be in the future")
    private LocalDate dueDate;
}

