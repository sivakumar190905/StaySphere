package com.staysphere.backend.repository;

import com.staysphere.backend.model.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface HotelRepository extends MongoRepository<Hotel, String> {
    
    List<Hotel> findByFeaturedTrue();
    
    default List<Hotel> findByOwnerId(Long ownerId) {
        return findAll().stream()
                .filter(h -> h.getOwner() != null && ownerId.equals(h.getOwner().getId()))
                .collect(Collectors.toList());
    }
}
