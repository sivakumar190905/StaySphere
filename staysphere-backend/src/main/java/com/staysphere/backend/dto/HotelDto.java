package com.staysphere.backend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDto {
    private String id;
    private String name;
    private String city;
    private String country;
    private String address;
    private Integer stars;
    private Double rating;
    private Integer reviewCount;
    private String description;
    private List<String> images;
    private List<String> amenities;
    private Double basePrice;
    private String tag; // 'Best Seller' | 'Luxury Stay' etc.
    private Boolean featured;
    private List<RoomDto> rooms;
    private List<ReviewDto> reviews;
    private Long ownerId;
    private Boolean hasRooms;
    private String message;
}
