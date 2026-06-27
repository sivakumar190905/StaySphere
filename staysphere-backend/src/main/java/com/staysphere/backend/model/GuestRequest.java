package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "guestRequests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestRequest {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    private Booking booking;

    private String requestType; // 'Extra Towels', 'Extra Pillow', 'Airport Pickup', 'Late Checkout'

    private String details;

    @Builder.Default
    private String status = "OPEN"; // 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
