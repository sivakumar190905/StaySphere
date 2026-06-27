package com.staysphere.backend.repository;

import com.staysphere.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, Long> {
    
    default List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return findAll().stream()
                .filter(n -> n.getUser() != null && userId.equals(n.getUser().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }
}
