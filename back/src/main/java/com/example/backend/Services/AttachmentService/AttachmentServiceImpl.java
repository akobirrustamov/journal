package com.example.backend.Services.AttachmentService;

import com.example.backend.Entity.Attachment;
import com.example.backend.Repository.AttachmentRepo;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {
    private final AttachmentRepo attachmentRepo;

    @Override
    public HttpEntity<?> uploadFile(MultipartFile photo, String prefix) throws IOException {
        Attachment attachment = Attachment.createAttachment(photo, prefix);
        if (attachment == null) return ResponseEntity.badRequest().build();
        attachmentRepo.save(attachment);
        return ResponseEntity.ok(attachment.getId());
    }



    @Override
    public void getFile(HttpServletResponse response, UUID id) throws IOException {
        Optional<Attachment> attachmentOptional = attachmentRepo.findById(id);
        System.out.println(id);
        if (attachmentOptional.isPresent()) {
            Attachment attachment = attachmentOptional.get();
            String prefix = attachment.getPrefix();
            String name = attachment.getName();
            String path = "backend/files" + prefix + "/" + name;
            FileCopyUtils.copy(new FileInputStream(path), response.getOutputStream());
        }
    }
}
