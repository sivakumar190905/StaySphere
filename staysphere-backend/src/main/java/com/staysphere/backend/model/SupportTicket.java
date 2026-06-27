package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "supportTickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    private User user;

    private String subject;

    private String description;

    @Builder.Default
    private String status = "OPEN"; // 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED'

    @Builder.Default
    private String priority = "MEDIUM"; // 'LOW', 'MEDIUM', 'HIGH'

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
