package com.staysphere.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicketDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private String subject;
    private String description;
    private String status; // 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED'
    private String priority; // 'LOW', 'MEDIUM', 'HIGH'
    private LocalDateTime createdAt;
}
