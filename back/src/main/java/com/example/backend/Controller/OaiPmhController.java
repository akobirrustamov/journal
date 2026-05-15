package com.example.backend.Controller;

import com.example.backend.Entity.Article;
import com.example.backend.Enums.ArticleStatus;
import com.example.backend.Repository.ArticleRepo;
import com.example.backend.Services.CitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting) endpoint.
 *
 * Allows academic harvesters (BASE, CORE, OpenDOAR, DRIVER, etc.) to
 * automatically collect metadata from all published articles.
 *
 * Supports verbs:
 *   Identify            – repository description
 *   ListMetadataFormats – supported formats (oai_dc)
 *   ListIdentifiers     – list article identifiers
 *   ListRecords         – full metadata harvest
 *   GetRecord           – single article metadata
 *
 * URL: /oai-pmh?verb=Identify
 *      /oai-pmh?verb=ListRecords&metadataPrefix=oai_dc
 *      /oai-pmh?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:{host}:{id}
 */
@RestController
@RequestMapping("/oai-pmh")
@RequiredArgsConstructor
@Tag(name = "OAI-PMH", description = "Open Archives Protocol for Metadata Harvesting")
public class OaiPmhController {

    private final ArticleRepo articleRepo;
    private final CitationService citationService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.name:Scientific Journal Platform}")
    private String repoName;

    @Value("${spring.mail.username:admin@journal.com}")
    private String adminEmail;

    @GetMapping(produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "OAI-PMH endpoint for academic metadata harvesting")
    public ResponseEntity<String> oaiPmh(
            @RequestParam String verb,
            @RequestParam(required = false) String metadataPrefix,
            @RequestParam(required = false) String identifier,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String until) {

        String responseDate = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        String requestUrl = baseUrl + "/oai-pmh";

        return switch (verb) {
            case "Identify"            -> ResponseEntity.ok(identify(responseDate, requestUrl));
            case "ListMetadataFormats" -> ResponseEntity.ok(listMetadataFormats(responseDate, requestUrl));
            case "ListIdentifiers"     -> ResponseEntity.ok(listIdentifiers(responseDate, requestUrl));
            case "ListRecords"         -> ResponseEntity.ok(listRecords(responseDate, requestUrl, metadataPrefix));
            case "GetRecord"           -> ResponseEntity.ok(getRecord(responseDate, requestUrl, identifier, metadataPrefix));
            default                    -> ResponseEntity.badRequest().body(badVerbError(responseDate, requestUrl, verb));
        };
    }

    // ── OAI-PMH Responses ─────────────────────────────────────────────

    private String identify(String responseDate, String requestUrl) {
        return oaiEnvelope(responseDate, requestUrl, "verb", "Identify",
            "<Identify>" +
            "<repositoryName>" + repoName + "</repositoryName>" +
            "<baseURL>" + requestUrl + "</baseURL>" +
            "<protocolVersion>2.0</protocolVersion>" +
            "<adminEmail>" + adminEmail + "</adminEmail>" +
            "<earliestDatestamp>2024-01-01T00:00:00Z</earliestDatestamp>" +
            "<deletedRecord>no</deletedRecord>" +
            "<granularity>YYYY-MM-DD</granularity>" +
            "</Identify>");
    }

    private String listMetadataFormats(String responseDate, String requestUrl) {
        return oaiEnvelope(responseDate, requestUrl, "verb", "ListMetadataFormats",
            "<ListMetadataFormats>" +
            "<metadataFormat>" +
            "<metadataPrefix>oai_dc</metadataPrefix>" +
            "<schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>" +
            "<metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>" +
            "</metadataFormat>" +
            "</ListMetadataFormats>");
    }

    private String listIdentifiers(String responseDate, String requestUrl) {
        List<Article> articles = articleRepo.findAllByStatus(
                ArticleStatus.PUBLISHED, PageRequest.of(0, 1000)).getContent();
        StringBuilder sb = new StringBuilder("<ListIdentifiers>");
        for (Article a : articles) {
            sb.append("<header>")
              .append("<identifier>oai:").append(baseUrl.replaceAll("https?://", "")).append(":").append(a.getId()).append("</identifier>")
              .append("<datestamp>").append(a.getPublishedAt() != null ? a.getPublishedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : "").append("</datestamp>")
              .append("</header>");
        }
        sb.append("</ListIdentifiers>");
        return oaiEnvelope(responseDate, requestUrl, "verb", "ListIdentifiers", sb.toString());
    }

    private String listRecords(String responseDate, String requestUrl, String prefix) {
        if (!"oai_dc".equals(prefix)) {
            return oaiEnvelope(responseDate, requestUrl, "verb", "ListRecords",
                "<error code=\"cannotDisseminateFormat\">Only oai_dc supported</error>");
        }
        List<Article> articles = articleRepo.findAllByStatus(
                ArticleStatus.PUBLISHED, PageRequest.of(0, 500)).getContent();
        StringBuilder sb = new StringBuilder("<ListRecords>");
        for (Article a : articles) {
            sb.append(buildRecord(a));
        }
        sb.append("</ListRecords>");
        return oaiEnvelope(responseDate, requestUrl, "verb", "ListRecords", sb.toString());
    }

    private String getRecord(String responseDate, String requestUrl, String identifier, String prefix) {
        if (identifier == null) return badVerbError(responseDate, requestUrl, "GetRecord");
        // extract UUID from oai:host:uuid
        String[] parts = identifier.split(":");
        UUID id;
        try {
            id = UUID.fromString(parts[parts.length - 1]);
        } catch (Exception e) {
            return oaiEnvelope(responseDate, requestUrl, "identifier", identifier,
                "<error code=\"idDoesNotExist\">Invalid identifier</error>");
        }
        return articleRepo.findById(id)
                .map(a -> oaiEnvelope(responseDate, requestUrl, "identifier", identifier,
                    "<GetRecord>" + buildRecord(a) + "</GetRecord>"))
                .orElse(oaiEnvelope(responseDate, requestUrl, "identifier", identifier,
                    "<error code=\"idDoesNotExist\">Article not found</error>"));
    }

    private String buildRecord(Article a) {
        String oaiId = "oai:" + baseUrl.replaceAll("https?://", "") + ":" + a.getId();
        String dc = citationService.toDublinCoreXml(a);
        return "<record>" +
               "<header><identifier>" + oaiId + "</identifier>" +
               "<datestamp>" + (a.getPublishedAt() != null ? a.getPublishedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : "") + "</datestamp></header>" +
               "<metadata>" + dc + "</metadata>" +
               "</record>";
    }

    private String oaiEnvelope(String responseDate, String requestUrl, String reqAttr, String reqVal, String body) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
               "<OAI-PMH xmlns=\"http://www.openarchives.org/OAI/2.0/\"" +
               " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" +
               " xsi:schemaLocation=\"http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd\">" +
               "<responseDate>" + responseDate + "</responseDate>" +
               "<request " + reqAttr + "=\"" + reqVal + "\">" + requestUrl + "</request>" +
               body +
               "</OAI-PMH>";
    }

    private String badVerbError(String responseDate, String requestUrl, String verb) {
        return oaiEnvelope(responseDate, requestUrl, "verb", verb,
            "<error code=\"badVerb\">Illegal OAI verb: " + verb + "</error>");
    }
}

