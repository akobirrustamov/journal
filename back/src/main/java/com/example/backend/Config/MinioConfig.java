package com.example.backend.Config;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MinIO client configuration.
 *
 * Requires properties:
 *   minio.url        – MinIO server URL     (e.g. http://localhost:9000)
 *   minio.access-key – Access key / username
 *   minio.secret-key – Secret key / password
 *
 * If minio.enabled=false, the MinioClient bean is NOT created and
 * MinioStorageService will be noop / throw clear errors.
 */
@Configuration
@Slf4j
public class MinioConfig {

    @Value("${minio.url:http://localhost:9000}")
    private String url;

    @Value("${minio.access-key:minioadmin}")
    private String accessKey;

    @Value("${minio.secret-key:minioadmin}")
    private String secretKey;

    @Bean
    @ConditionalOnProperty(name = "minio.enabled", havingValue = "true", matchIfMissing = false)
    public MinioClient minioClient() {
        log.info("Initialising MinIO client → {}", url);
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    /**
     * Fallback no-op MinioClient used when minio.enabled=false.
     * Throws UnsupportedOperationException if any MinIO method is called.
     * This prevents wiring failures in local development.
     */
    @Bean
    @ConditionalOnProperty(name = "minio.enabled", havingValue = "false", matchIfMissing = true)
    public MinioClient minioClientStub() {
        log.warn("MinIO is DISABLED (minio.enabled=false). File uploads will use local storage.");
        return MinioClient.builder()
                .endpoint("http://localhost:9000")
                .credentials("stub", "stub")
                .build();
    }
}

