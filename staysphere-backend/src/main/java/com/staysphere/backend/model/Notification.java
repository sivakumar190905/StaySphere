package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "notificationLogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    private User user;

    private String title;

    private String message;

    private String type; // Booking Approved, Room Assigned, Check-In Reminder, Invoice Generated, etc.

    @Builder.Default
    private Boolean isRead = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
