package com.staysphere.backend.service;

import com.staysphere.backend.dto.NotificationDto;
import com.staysphere.backend.model.User;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getUserNotifications(Long userId);
    void markAllRead(Long userId);
    void addNotification(User user, String title, String message, String type);
}
