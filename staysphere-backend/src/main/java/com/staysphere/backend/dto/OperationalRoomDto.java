package com.staysphere.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationalRoomDto {
    private Long id;
    private String number;
    private String status;
    private String roomId;
    private String roomName;
    private String hotelId;
    private String hotelName;
}
