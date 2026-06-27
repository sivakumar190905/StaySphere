package com.staysphere.backend.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class StartupValidator implements InitializingBean {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void afterPropertiesSet() throws Exception {
        // 1. Validate environment variables
        String mongoUri = System.getenv("MONGODB_URI");
        String jwtSecret = System.getenv("JWT_SECRET");
        String clientUrl = System.getenv("CLIENT_URL");

        if (mongoUri == null || mongoUri.trim().isEmpty()) {
            throw new IllegalStateException("FATAL: Environment variable MONGODB_URI is missing!");
        }
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("FATAL: Environment variable JWT_SECRET is missing!");
        }
        if (clientUrl == null || clientUrl.trim().isEmpty()) {
            throw new IllegalStateException("FATAL: Environment variable CLIENT_URL is missing!");
        }

        // 2. Connect & ping database
        try {
            mongoTemplate.executeCommand("{ping: 1}");
            System.out.println("===================================================");
            System.out.println("MongoDB Connected Successfully");
            System.out.println("===================================================");
        } catch (Exception e) {
            System.err.println("===================================================");
            System.err.println("MongoDB Connection Failed: " + e.getMessage());
            System.err.println("===================================================");
            throw new IllegalStateException("MongoDB Connection Failed. Startup aborted.", e);
        }
    }
}
