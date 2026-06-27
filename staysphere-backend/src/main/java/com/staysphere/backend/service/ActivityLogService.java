package com.staysphere.backend.service;

import com.staysphere.backend.model.ActivityLog;
import com.staysphere.backend.model.User;
import java.util.List;

public interface ActivityLogService {
    void logActivity(User user, String action, String details, String ipAddress);
    void logActivity(User user, String action, String details, String ipAddress, String entityType, String entityId);
    List<ActivityLog> getAllLogs();
}
