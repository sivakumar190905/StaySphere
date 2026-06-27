package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "partnerRequests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRequest {

    @Id
    private Long id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String firstName;

    private String lastName;

    private String phone;

    private String hotelName;

    private String hotelAddress;

    @Builder.Default
    private String status = "PENDING"; // 'PENDING', 'APPROVED', 'REJECTED'

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
