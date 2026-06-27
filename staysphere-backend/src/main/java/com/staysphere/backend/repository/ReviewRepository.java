package com.staysphere.backend.repository;

import com.staysphere.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    default List<Review> findByHotelId(String hotelId) {
        return findAll().stream()
                .filter(r -> r.getHotel() != null && hotelId.equals(r.getHotel().getId()))
                .collect(Collectors.toList());
    }
}
