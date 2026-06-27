package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    private String id;

    @DocumentReference(lazy = true)
    private Booking booking;

    private Double amount;

    private String method; // 'CARD', 'UPI', 'NETBANKING', 'CASH'

    private String status; // 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'

    private String transactionId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
