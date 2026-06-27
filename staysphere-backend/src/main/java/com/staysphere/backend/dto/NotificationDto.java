package com.staysphere.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private String id;
    private String title;
    private String message;
    private String time; // map to timeString in Entity
    private Boolean read; // map to isRead in Entity
}
