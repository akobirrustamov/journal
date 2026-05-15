package com.example.backend.Services;

import com.example.backend.Entity.Article;
import com.example.backend.Entity.Journal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Service for generating and managing Digital Object Identifiers (DOIs).
 *
 * DOI Format: 10.{prefix}/{journal-slug}/{year}/{article-id-short}
 *
 * For production CrossRef registration, implement the CrossRef Metadata API:
 * https://www.crossref.org/documentation/member-setup/direct-deposit-xml/
 */
@Service
@Slf4j
public class DoiService {

    /** CrossRef DOI prefix assigned to your organisation */
    @Value("${doi.prefix:10.12345}")
    private String doiPrefix;

    @Value("${doi.crossref.username:}")
    private String crossrefUsername;

    @Value("${doi.crossref.password:}")
    private String crossrefPassword;

    @Value("${doi.crossref.enabled:false}")
    private boolean crossrefEnabled;

    /**
     * Generate a DOI for an article.
     * Format: 10.{prefix}/{journal-slug}/{year}/{random-hex}
     */
    public String generateArticleDoi(Article article) {
        String journalSlug = article.getJournal() != null
                ? article.getJournal().getSlug()
                : "journal";
        String year = article.getSubmittedAt() != null
                ? String.valueOf(article.getSubmittedAt().getYear())
                : String.valueOf(java.time.LocalDate.now().getYear());
        String shortId = article.getId().toString().replace("-", "").substring(0, 8);
        return doiPrefix + "/" + journalSlug + "." + year + "." + shortId;
    }

    /**
     * Generate a DOI for a journal issue.
     */
    public String generateIssueDoi(String journalSlug, int volume, int issue) {
        return doiPrefix + "/" + journalSlug + ".v" + volume + "i" + issue;
    }

    /**
     * Submit DOI metadata to CrossRef (requires CrossRef membership).
     * This is a stub – integrate with CrossRef Deposit API in production.
     */
    public void registerWithCrossRef(Article article) {
        if (!crossrefEnabled) {
            log.info("CrossRef registration disabled. DOI generated locally: {}", article.getDoi());
            return;
        }
        // TODO: Build CrossRef XML deposit and call:
        // POST https://doi.crossref.org/servlet/deposit
        // with credentials and XML metadata per CrossRef schema
        log.info("CrossRef registration for DOI {} would be submitted here.", article.getDoi());
    }

    /** Build the full resolvable DOI URL */
    public String toDoiUrl(String doi) {
        return "https://doi.org/" + doi;
    }
}

