package com.staysphere.backend.repository;

import com.staysphere.backend.model.RewardPoints;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface RewardPointsRepository extends MongoRepository<RewardPoints, Long> {
    
    default List<RewardPoints> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return findAll().stream()
                .filter(rp -> rp.getUser() != null && userId.equals(rp.getUser().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    default int getBalanceByUserId(Long userId) {
        return findByUserIdOrderByCreatedAtDesc(userId).stream()
                .mapToInt(rp -> "EARNED".equalsIgnoreCase(rp.getTransactionType()) ? rp.getPoints() : -rp.getPoints())
                .sum();
    }
}
