package com.staysphere.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/version")
public class VersionController {

    @GetMapping
    public ResponseEntity<?> getVersion() {
        return ResponseEntity.ok(Map.of(
                "version", "1.0.0",
                "status", "RELEASE",
                "name", "StaySphere Platform"
        ));
    }
}
