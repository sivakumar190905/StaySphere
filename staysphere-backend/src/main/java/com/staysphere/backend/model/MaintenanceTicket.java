package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "maintenanceTickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicket {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    private RoomNumber roomNumber;

    private String description;

    @Builder.Default
    private String status = "OPEN"; // 'OPEN', 'RESOLVED'

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
