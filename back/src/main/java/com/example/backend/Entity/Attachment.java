package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "attachment")
public class Attachment {
    @Id
    private UUID id;

    private String prefix;
    private String name;

    /** MIME type e.g. application/pdf, image/jpeg */
    @Column(name = "content_type")
    private String contentType;

    /** File size in bytes */
    private Long size;

    /** StorageType: LOCAL or MINIO */
    @Column(name = "storage_type")
    @Enumerated(EnumType.STRING)
    private StorageType storageType = StorageType.LOCAL;

    /** MinIO bucket name (when storageType = MINIO) */
    @Column(name = "bucket_name")
    private String bucketName;

    /** MinIO object name / key (when storageType = MINIO) */
    @Column(name = "object_name")
    private String objectName;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public enum StorageType { LOCAL, MINIO }

    /** Legacy factory for local storage */
    public static Attachment createAttachment(MultipartFile photo, String prefix) throws IOException {
        Attachment attachment = null;
        if (photo != null && !photo.isEmpty()) {
            UUID id = UUID.randomUUID();
            String fileName = id + "_" + photo.getOriginalFilename();
            String filePath = "backend/files" + prefix + "/" + fileName;
            File file = new File(filePath);
            file.getParentFile().mkdirs();
            try (OutputStream outputStream = new FileOutputStream(file)) {
                FileCopyUtils.copy(photo.getInputStream(), outputStream);
            }
            attachment = new Attachment(id, prefix, fileName,
                    photo.getContentType(), photo.getSize(),
                    StorageType.LOCAL, null, null,
                    LocalDateTime.now());
        }
        return attachment;
    }

    /** Factory for MinIO storage */
    public static Attachment createMinioAttachment(UUID id, String originalFilename,
                                                    String contentType, Long size,
                                                    String bucketName, String objectName) {
        return new Attachment(id, null, originalFilename,
                contentType, size, StorageType.MINIO,
                bucketName, objectName, LocalDateTime.now());
    }
}
