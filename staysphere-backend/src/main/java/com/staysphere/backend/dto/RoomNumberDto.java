package com.staysphere.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomNumberDto {
    private String number;
    private String status; // 'Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked'
}
