package com.staysphere.backend.service;

import com.staysphere.backend.model.ActivityLog;
import com.staysphere.backend.model.User;
import com.staysphere.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Override
    @Transactional
    public void logActivity(User user, String action, String details, String ipAddress) {
        logActivity(user, action, details, ipAddress, null, null);
    }

    @Override
    @Transactional
    public void logActivity(User user, String action, String details, String ipAddress, String entityType, String entityId) {
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .description(details)
                .ipAddress(ipAddress)
                .entityType(entityType)
                .entityId(entityId)
                .build();
        activityLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
