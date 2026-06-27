package com.staysphere.backend.repository;

import com.staysphere.backend.model.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ActivityLog> findAllByOrderByCreatedAtDesc();
}
