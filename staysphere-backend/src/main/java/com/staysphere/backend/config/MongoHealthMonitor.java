package com.staysphere.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class MongoHealthMonitor {

    @Autowired
    private MongoTemplate mongoTemplate;

    private volatile String connectionStatus = "connected";
    private int consecutiveFailures = 0;

    public String getConnectionStatus() {
        return connectionStatus;
    }

    @Scheduled(fixedRate = 30000)
    public void monitorHealth() {
        try {
            mongoTemplate.executeCommand("{ping: 1}");
            if (consecutiveFailures > 0) {
                System.out.println("MongoDB Connected Successfully after retrying");
            }
            connectionStatus = "connected";
            consecutiveFailures = 0;
        } catch (Exception e) {
            consecutiveFailures++;
            System.err.println("MongoDB Health Check Failed (Failure #" + consecutiveFailures + "): " + e.getMessage());
            if (consecutiveFailures <= 2) {
                connectionStatus = "reconnecting";
                System.out.println("MongoDB Reconnection status: RECONNECTING");
            } else {
                connectionStatus = "disconnected";
                System.err.println("MongoDB status: DISCONNECTED");
            }
        }
    }
}
