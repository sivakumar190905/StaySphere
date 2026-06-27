package com.staysphere.backend.repository;

import com.staysphere.backend.model.Policy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PolicyRepository extends MongoRepository<Policy, String> {
    Optional<Policy> findByNameIgnoreCase(String name);
}
