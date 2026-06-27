package com.staysphere.backend.controller;

import com.staysphere.backend.service.AiService;
import com.staysphere.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }

        String userEmail = userDetails != null ? userDetails.getUsername() : "anonymous@staysphere.com";
        String response = aiService.generateResponse(message, userEmail);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
