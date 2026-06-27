package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "hotels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {

    @Id
    private String id; // custom ID, e.g. "h_mumbai_0"

    @Indexed
    private String name;

    @Indexed
    private String city;

    private String country;

    private String address;

    private Integer stars;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    private String description;

    private Double basePrice;

    private String tag; // 'Best Seller' | 'Luxury Stay' | etc.

    @Builder.Default
    private Boolean featured = false;

    @DocumentReference(lazy = true)
    private User owner;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @DocumentReference(lazy = true)
    @Builder.Default
    private List<Room> rooms = new ArrayList<>();

    @DocumentReference(lazy = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
