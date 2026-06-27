package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    private String id;

    private String invoiceNumber;

    @DocumentReference(lazy = true)
    private Booking booking;

    private Double subtotal;

    @Builder.Default
    private Double discount = 0.0;

    @Builder.Default
    private Double cgst = 0.0;

    @Builder.Default
    private Double sgst = 0.0;

    private Double total;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
