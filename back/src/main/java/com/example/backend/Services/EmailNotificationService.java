package com.example.backend.Services;

import com.example.backend.Entity.Article;
import com.example.backend.Entity.ArticleAuthor;
import com.example.backend.Entity.Review;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:akobir@bxu.uz}")
    private String fromAddress;

    @Value("${app.name:Scientific Journal Platform}")
    private String appName;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // ── Public API: accept only plain data, never JPA entities ───────────

    @Async
    public void notifyArticleSubmitted(String title, String recipientEmail) {
        String subject = "[" + appName + "] New Article Submitted: " + title;
        sendSimpleMail(fromAddress, subject, "Title: " + title);
        if (recipientEmail != null) {
            sendSimpleMail(recipientEmail, subject, "Your article was submitted successfully.");
        }
    }

    @Async
    public void notifyArticleAccepted(String title, String recipientEmail) {
        if (recipientEmail == null) return;
        sendSimpleMail(recipientEmail,
            "[" + appName + "] Article Accepted",
            "Congratulations! Article accepted: " + title);
    }

    @Async
    public void notifyArticleRejected(String title, String recipientEmail) {
        if (recipientEmail == null) return;
        sendSimpleMail(recipientEmail,
            "[" + appName + "] Article Decision",
            "Article not accepted: " + title);
    }

    @Async
    public void notifyRevisionRequired(String title, String recipientEmail) {
        if (recipientEmail == null) return;
        sendSimpleMail(recipientEmail,
            "[" + appName + "] Revision Required",
            "Revision requested for: " + title);
    }

    @Async
    public void notifyArticlePublished(String title, String slug, String doi, String recipientEmail) {
        String doiPart = doi != null ? ", DOI: https://doi.org/" + doi : "";
        String body = title + doiPart + " is now public at " + baseUrl + "/articles/" + slug;
        if (recipientEmail != null) {
            sendSimpleMail(recipientEmail, "[" + appName + "] Article Published", body);
        }
    }

    @Async
    public void notifyReviewerInvited(String reviewerEmail, String articleTitle) {
        if (reviewerEmail == null) return;
        sendSimpleMail(reviewerEmail,
            "[" + appName + "] Review Invitation",
            "You are invited to review: " + articleTitle);
    }

    @Async
    public void notifyReviewerResponse(String editorEmail, String reviewerName, String articleTitle, boolean accepted) {
        String to = editorEmail != null ? editorEmail : fromAddress;
        sendSimpleMail(to,
            "[" + appName + "] Reviewer " + (accepted ? "Accepted" : "Declined"),
            reviewerName + " responded to review of: " + articleTitle);
    }

    @Async
    public void notifyAllReviewsComplete(String articleTitle) {
        sendSimpleMail(fromAddress,
            "[" + appName + "] All Reviews Complete",
            "All reviews done for: " + articleTitle);
    }

    // ── Convenience overloads that extract data from entities (called inside @Transactional) ──

    public void notifyArticleSubmitted(Article article) {
        String email = resolveRecipientEmail(article);
        notifyArticleSubmitted(article.getTitle(), email);
    }

    public void notifyArticleAccepted(Article article) {
        notifyArticleAccepted(article.getTitle(), resolveRecipientEmail(article));
    }

    public void notifyArticleRejected(Article article) {
        notifyArticleRejected(article.getTitle(), resolveRecipientEmail(article));
    }

    public void notifyRevisionRequired(Article article) {
        notifyRevisionRequired(article.getTitle(), resolveRecipientEmail(article));
    }

    public void notifyArticlePublished(Article article) {
        notifyArticlePublished(article.getTitle(), article.getSlug(), article.getDoi(), resolveRecipientEmail(article));
    }

    public void notifyReviewerInvited(Review review) {
        if (review.getReviewer() == null) return;
        notifyReviewerInvited(review.getReviewer().getEmail(), review.getArticle().getTitle());
    }

    public void notifyReviewerResponse(Review review, boolean accepted) {
        String email = review.getAssignedBy() != null ? review.getAssignedBy().getEmail() : null;
        String reviewer = review.getReviewer() != null ? review.getReviewer().getName() : "Reviewer";
        notifyReviewerResponse(email, reviewer, review.getArticle().getTitle(), accepted);
    }

    public void notifyAllReviewsComplete(Article article) {
        notifyAllReviewsComplete(article.getTitle());
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /** Must be called within an active @Transactional — extracts email before async dispatch. */
    private String resolveRecipientEmail(Article article) {
        try {
            if (article.getAuthors() != null) {
                return article.getAuthors().stream()
                    .filter(ArticleAuthor::isCorresponding)
                    .filter(a -> a.getEmail() != null)
                    .map(ArticleAuthor::getEmail)
                    .findFirst()
                    .orElseGet(() -> article.getSubmittedBy() != null ? article.getSubmittedBy().getEmail() : null);
            }
        } catch (Exception e) {
            log.warn("Could not resolve recipient email: {}", e.getMessage());
        }
        return article.getSubmittedBy() != null ? article.getSubmittedBy().getEmail() : null;
    }

    private void sendSimpleMail(String to, String subject, String text) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(text);
            mailSender.send(msg);
            log.info("Email sent to {} | {}", to, subject);
        } catch (Exception e) {
            log.error("Email failed to {}: {}", to, e.getMessage());
        }
    }
}
