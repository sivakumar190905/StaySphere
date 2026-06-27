package com.staysphere.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.trim().isEmpty() && 
            apiKey != null && !apiKey.trim().isEmpty() && 
            apiSecret != null && !apiSecret.trim().isEmpty()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName.trim(),
                "api_key", apiKey.trim(),
                "api_secret", apiSecret.trim()
            ));
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        if (cloudinary == null) {
            System.out.println("WARNING: Cloudinary credentials are not configured. Returning local placeholder URL.");
            return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
        }
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }
}
