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

    @Async
    public void notifyArticleSubmitted(Article article) {
        String subject = "[" + appName + "] New Article Submitted: " + article.getTitle();
        sendSimpleMail(fromAddress, subject, "Title: " + article.getTitle());
        notifyCorrespondingAuthor(article, subject, "Your article was submitted successfully.");
    }

    @Async
    public void notifyArticleAccepted(Article article) {
        notifyCorrespondingAuthor(article,
            "[" + appName + "] Article Accepted",
            "Congratulations! Article accepted: " + article.getTitle());
    }

    @Async
    public void notifyArticleRejected(Article article) {
        notifyCorrespondingAuthor(article,
            "[" + appName + "] Article Decision",
            "Article not accepted: " + article.getTitle());
    }

    @Async
    public void notifyRevisionRequired(Article article) {
        notifyCorrespondingAuthor(article,
            "[" + appName + "] Revision Required",
            "Revision requested for: " + article.getTitle());
    }

    @Async
    public void notifyArticlePublished(Article article) {
        String doi = article.getDoi() != null ? ", DOI: https://doi.org/" + article.getDoi() : "";
        notifyCorrespondingAuthor(article,
            "[" + appName + "] Article Published",
            article.getTitle() + doi + " is now public at " + baseUrl + "/articles/" + article.getSlug());
    }

    @Async
    public void notifyReviewerInvited(Review review) {
        if (review.getReviewer().getEmail() == null) return;
        sendSimpleMail(review.getReviewer().getEmail(),
            "[" + appName + "] Review Invitation",
            "You are invited to review: " + review.getArticle().getTitle());
    }

    @Async
    public void notifyReviewerResponse(Review review, boolean accepted) {
        String email = review.getAssignedBy() != null ? review.getAssignedBy().getEmail() : fromAddress;
        if (email == null) return;
        sendSimpleMail(email,
            "[" + appName + "] Reviewer " + (accepted ? "Accepted" : "Declined"),
            review.getReviewer().getName() + " responded to review of: " + review.getArticle().getTitle());
    }

    @Async
    public void notifyAllReviewsComplete(Article article) {
        sendSimpleMail(fromAddress,
            "[" + appName + "] All Reviews Complete",
            "All reviews done for: " + article.getTitle());
    }

    private void notifyCorrespondingAuthor(Article article, String subject, String body) {
        if (article.getAuthors() == null) return;
        article.getAuthors().stream()
            .filter(ArticleAuthor::isCorresponding)
            .filter(a -> a.getEmail() != null)
            .findFirst()
            .ifPresentOrElse(
                a -> sendSimpleMail(a.getEmail(), subject, body),
                () -> {
                    if (article.getSubmittedBy() != null && article.getSubmittedBy().getEmail() != null)
                        sendSimpleMail(article.getSubmittedBy().getEmail(), subject, body);
                });
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
            log.error("Email failed: {}", e.getMessage());
        }
    }
}
