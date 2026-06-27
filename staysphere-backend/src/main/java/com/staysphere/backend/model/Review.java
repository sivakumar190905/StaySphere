package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String id; // custom ID, e.g. "h_mumbai_0-rev1"

    @DocumentReference(lazy = true)
    private Hotel hotel;

    private String guestName;

    private Double rating;

    private LocalDate date;

    private String comment;

    private String positivePoints;

    private String negativePoints;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
