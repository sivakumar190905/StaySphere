package com.staysphere.backend.controller;

import com.staysphere.backend.config.MongoHealthMonitor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private MongoHealthMonitor mongoHealthMonitor;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public ResponseEntity<?> checkHealth() {
        String dbName = "staysphere";
        try {
            dbName = mongoTemplate.getDb().getName();
        } catch (Exception e) {
            // Ignore database name query errors
        }

        return ResponseEntity.ok(Map.of(
                "status", mongoHealthMonitor.getConnectionStatus(),
                "database", dbName
        ));
    }
}
