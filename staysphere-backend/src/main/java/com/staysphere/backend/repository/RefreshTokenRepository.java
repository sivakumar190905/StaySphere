package com.staysphere.backend.repository;

import com.staysphere.backend.model.RefreshToken;
import com.staysphere.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    default int deleteByUser(User user) {
        int count = 0;
        for (RefreshToken rt : findAll()) {
            if (rt.getUser() != null && user.getId().equals(rt.getUser().getId())) {
                delete(rt);
                count++;
            }
        }
        return count;
    }
}
