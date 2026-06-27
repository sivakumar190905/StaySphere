package com.staysphere.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicketDto {
    private Long id;
    private Long roomNumberId;
    private String roomNumber;
    private String roomName;
    private String hotelName;
    private String description;
    private String status; // 'OPEN', 'RESOLVED'
    private LocalDateTime createdAt;
}
