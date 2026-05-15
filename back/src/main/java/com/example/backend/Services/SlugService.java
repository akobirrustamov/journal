package com.example.backend.Services;

import com.example.backend.Entity.Journal;
import com.example.backend.Repository.JournalRepo;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.UUID;

/**
 * Utility service for generating SEO-friendly URL slugs.
 * Used for journals, issues, and articles.
 */
@Component
@Slf4j
public class SlugService {

    /**
     * Converts a title to a URL-safe slug.
     * e.g. "Journal of Computer Science" → "journal-of-computer-science"
     */
    public String toSlug(String title) {
        if (StringUtils.isBlank(title)) {
            return UUID.randomUUID().toString();
        }
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        return normalized
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
    }

    /**
     * Generates a unique slug for a journal, appending a counter if necessary.
     */
    public String uniqueJournalSlug(String title, JournalRepo repo) {
        String base = toSlug(title);
        String candidate = base;
        int counter = 2;
        while (repo.existsBySlug(candidate)) {
            candidate = base + "-" + counter++;
        }
        return candidate;
    }
}

