package com.staysphere.backend.repository;

import com.staysphere.backend.model.SupportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface SupportTicketRepository extends MongoRepository<SupportTicket, Long> {
    
    default List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return findAll().stream()
                .filter(t -> t.getUser() != null && userId.equals(t.getUser().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}
