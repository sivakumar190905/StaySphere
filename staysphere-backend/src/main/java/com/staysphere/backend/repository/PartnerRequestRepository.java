package com.staysphere.backend.repository;

import com.staysphere.backend.model.PartnerRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PartnerRequestRepository extends MongoRepository<PartnerRequest, Long> {
    Optional<PartnerRequest> findByEmail(String email);
    Boolean existsByEmail(String email);
}
