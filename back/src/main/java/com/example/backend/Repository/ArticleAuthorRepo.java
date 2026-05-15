package com.example.backend.Repository;

import com.example.backend.Entity.ArticleAuthor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ArticleAuthorRepo extends JpaRepository<ArticleAuthor, UUID> {
    List<ArticleAuthor> findAllByArticleIdOrderByOrderIndexAsc(UUID articleId);
    List<ArticleAuthor> findAllByUserId(UUID userId);
}

