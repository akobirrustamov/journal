package com.example.backend.Controller;

import com.example.backend.Payload.ApiResponse;
import com.example.backend.Payload.ArticleSeoMetadata;
import com.example.backend.Services.ArticleService;
import com.example.backend.Services.SeoMetadataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API for SEO metadata used by the frontend and search indexers.
 *
 * GET /api/v1/metadata/articles/{id}            – full SEO metadata object
 * GET /api/v1/metadata/articles/{id}/schema-org – Schema.org JSON-LD only
 */
@RestController
@RequestMapping("/api/v1/metadata")
@RequiredArgsConstructor
@Tag(name = "SEO Metadata", description = "Structured metadata for SEO and academic indexing")
public class MetadataController {

    private final ArticleService articleService;
    private final SeoMetadataService seoMetadataService;

    @GetMapping("/articles/{id}")
    @Operation(summary = "Get full SEO metadata for an article (OG, DC, Scholar tags, Schema.org)")
    public ResponseEntity<ApiResponse<ArticleSeoMetadata>> articleMeta(@PathVariable UUID id) {
        var article = articleService.getEntity(id);
        return ResponseEntity.ok(ApiResponse.ok(seoMetadataService.buildArticleMetadata(article)));
    }

    @GetMapping(value = "/articles/{id}/schema-org", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get Schema.org JSON-LD for an article")
    public ResponseEntity<String> schemaOrg(@PathVariable UUID id) {
        var article = articleService.getEntity(id);
        var meta = seoMetadataService.buildArticleMetadata(article);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(meta.getSchemaOrgJsonLd());
    }

    @GetMapping(value = "/articles/{id}/dublin-core", produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "Dublin Core XML metadata for OAI-PMH and indexers")
    public ResponseEntity<String> dublinCoreMeta(@PathVariable UUID id) {
        var article = articleService.getEntity(id);
        var meta = seoMetadataService.buildArticleMetadata(article);
        // Build minimal DC XML from returned metadata
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<metadata>\n");
        xml.append("  <dc:title>").append(meta.getDcTitle()).append("</dc:title>\n");
        if (meta.getDcCreators() != null)
            meta.getDcCreators().forEach(c -> xml.append("  <dc:creator>").append(c).append("</dc:creator>\n"));
        xml.append("</metadata>");
        return ResponseEntity.ok(xml.toString());
    }
}

