package com.staysphere.backend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDto {
    private String id;
    private String name;
    private String type; // 'deluxe' | 'suite' | 'standard' | 'family'
    private Double price;
    private Capacity capacity;
    private List<String> amenities;
    private List<String> images;
    private Integer availableCount;
    private Integer sizeSqFt;
    private String status; // 'Available' | 'Occupied'
    private List<RoomNumberDto> roomNumbers;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Capacity {
        private Integer guests;
        private Integer beds;
    }
}
