package com.example.backend.Services;

import com.example.backend.Entity.Attachment;
import com.example.backend.Repository.AttachmentRepo;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Service for storing and retrieving files in MinIO object storage.
 * Falls back gracefully to informative errors when MinIO is not configured.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MinioStorageService {

    private final MinioClient minioClient;
    private final AttachmentRepo attachmentRepo;

    @Value("${minio.bucket.articles:articles}")
    private String articlesBucket;

    @Value("${minio.bucket.journals:journals}")
    private String journalsBucket;

    @Value("${minio.bucket.reviews:reviews}")
    private String reviewsBucket;

    @Value("${minio.url:http://localhost:9000}")
    private String minioUrl;

    /**
     * Upload a file to the specified MinIO bucket and persist the Attachment record.
     *
     * @param file       multipart file from HTTP request
     * @param bucketName target MinIO bucket
     * @return persisted Attachment entity
     */
    public Attachment upload(MultipartFile file, String bucketName) throws Exception {
        ensureBucketExists(bucketName);

        UUID fileId = UUID.randomUUID();
        String objectName = fileId + "_" + sanitizeFilename(file.getOriginalFilename());

        minioClient.putObject(PutObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .stream(file.getInputStream(), file.getSize(), -1)
                .contentType(file.getContentType())
                .build());

        log.info("Uploaded file '{}' to MinIO bucket '{}'", objectName, bucketName);

        Attachment attachment = Attachment.createMinioAttachment(
                fileId,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                bucketName,
                objectName
        );
        return attachmentRepo.save(attachment);
    }

    /**
     * Upload a PDF article and return its persisted Attachment.
     */
    public Attachment uploadArticlePdf(MultipartFile pdfFile) throws Exception {
        return upload(pdfFile, articlesBucket);
    }

    /**
     * Upload a journal cover image.
     */
    public Attachment uploadJournalCover(MultipartFile imageFile) throws Exception {
        return upload(imageFile, journalsBucket);
    }

    /**
     * Upload a reviewer's attachment file.
     */
    public Attachment uploadReviewFile(MultipartFile reviewFile) throws Exception {
        return upload(reviewFile, reviewsBucket);
    }

    /**
     * Generate a pre-signed URL valid for 7 days.
     */
    public String getPresignedUrl(String bucketName, String objectName) throws Exception {
        return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(bucketName)
                .object(objectName)
                .expiry(7, TimeUnit.DAYS)
                .build());
    }

    /**
     * Get a direct download stream for an object.
     */
    public InputStream getObjectStream(String bucketName, String objectName) throws Exception {
        return minioClient.getObject(GetObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .build());
    }

    /**
     * Resolve the public URL for an Attachment.
     * For MinIO objects: returns presigned URL.
     * For LOCAL objects: returns the local fileserving URL.
     */
    public String resolveUrl(Attachment attachment) {
        if (attachment == null) return null;
        if (attachment.getStorageType() == Attachment.StorageType.MINIO) {
            try {
                return getPresignedUrl(attachment.getBucketName(), attachment.getObjectName());
            } catch (Exception e) {
                log.warn("Failed to generate presigned URL for object {}: {}", attachment.getObjectName(), e.getMessage());
                return minioUrl + "/" + attachment.getBucketName() + "/" + attachment.getObjectName();
            }
        }
        // LOCAL storage
        return "/api/v1/files/" + attachment.getId();
    }

    public void delete(String bucketName, String objectName) throws Exception {
        minioClient.removeObject(RemoveObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .build());
        log.info("Deleted object '{}' from bucket '{}'", objectName, bucketName);
    }

    // ── Private helpers ───────────────────────────────────────────────

    private void ensureBucketExists(String bucketName) throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                .bucket(bucketName).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            log.info("Created MinIO bucket: {}", bucketName);
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

