package com.staysphere.backend.controller;

import com.staysphere.backend.dto.NotificationDto;
import com.staysphere.backend.security.UserDetailsImpl;
import com.staysphere.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userDetails.getId());
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/read")
    public ResponseEntity<?> markNotificationsRead(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.markAllRead(userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
