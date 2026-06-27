package com.staysphere.backend.repository;

import com.staysphere.backend.model.PasswordResetToken;
import com.staysphere.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    
    default void deleteByUser(User user) {
        findAll().stream()
                .filter(t -> t.getUser() != null && user.getId().equals(t.getUser().getId()))
                .forEach(this::delete);
    }
}
