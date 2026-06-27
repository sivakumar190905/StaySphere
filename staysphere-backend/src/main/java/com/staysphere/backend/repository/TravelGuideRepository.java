package com.staysphere.backend.repository;

import com.staysphere.backend.model.TravelGuide;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TravelGuideRepository extends MongoRepository<TravelGuide, String> {
    Optional<TravelGuide> findByDestinationIgnoreCase(String destination);
}
