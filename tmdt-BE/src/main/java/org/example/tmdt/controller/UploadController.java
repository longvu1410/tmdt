package org.example.tmdt.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.example.tmdt.service.CloudinaryService;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String backendBaseUrl;

    private final Path root = Paths.get("uploads");

    @PostMapping("/upload")
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), this.root.resolve(filename));
        String url = backendBaseUrl + "/uploads/" + filename;
        return Map.of("url", url);
    }

    @PostMapping("/upload/video")
    public Map<String, String> uploadVideo(@RequestParam("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadVideo(file);
        return Map.of("url", url);
    }
}
