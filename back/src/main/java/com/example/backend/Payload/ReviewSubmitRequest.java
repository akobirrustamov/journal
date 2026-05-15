package com.example.backend.Payload;

import com.example.backend.Enums.ReviewDecision;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Request DTO for a reviewer submitting their review. */
@Data
public class ReviewSubmitRequest {

    @NotNull(message = "Decision is required")
    private ReviewDecision decision;

    private String commentsForAuthor;

    private String commentsForEditor;

    @Min(1) @Max(10)
    private Integer score;

    @Min(1) @Max(10)
    private Integer scoreOriginality;

    @Min(1) @Max(10)
    private Integer scoreMethodology;

    @Min(1) @Max(10)
    private Integer scoreClarity;
}

