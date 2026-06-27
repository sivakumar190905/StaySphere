package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "activityLogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    private User user;

    private String action;

    private String description;

    private String ipAddress;

    private String entityType;

    private String entityId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
