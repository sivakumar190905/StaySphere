package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    private String id; // maps to _id

    @Indexed
    private String hotelId;

    private String roomType;

    private String roomNumber;

    private String description;

    private Integer maxGuests;

    private String bedType;

    private Integer roomSize;

    private Double pricePerNight;

    @Builder.Default
    private Integer availableCount = 0;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, RESERVED, MAINTENANCE, OCCUPIED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
