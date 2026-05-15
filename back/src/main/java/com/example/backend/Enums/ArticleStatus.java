package com.example.backend.Enums;

/**
 * Represents the lifecycle state of a scientific article.
 *
 * Workflow: DRAFT → SUBMITTED → UNDER_REVIEW → REVISION_REQUIRED → ACCEPTED → PUBLISHED → ARCHIVED
 */
public enum ArticleStatus {
    /** Author saved but not yet submitted */
    DRAFT,
    /** Submitted by author, awaiting editor assignment */
    SUBMITTED,
    /** Assigned to reviewers, review in progress */
    UNDER_REVIEW,
    /** Reviewers requested revisions */
    REVISION_REQUIRED,
    /** Editor/admin accepted the article */
    ACCEPTED,
    /** Publicly published in an issue */
    PUBLISHED,
    /** Archived from active display */
    ARCHIVED,
    /** Rejected by editor or reviewers */
    REJECTED
}

