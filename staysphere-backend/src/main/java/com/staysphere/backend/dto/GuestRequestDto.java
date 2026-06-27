package com.staysphere.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestRequestDto {
    private Long id;
    private String bookingId;
    private String hotelName;
    private String roomNumber;
    private String requestType; // 'Extra Towels', 'Extra Pillow', 'Airport Pickup', 'Late Checkout'
    private String details;
    private String status; // 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'
    private LocalDateTime createdAt;
}
