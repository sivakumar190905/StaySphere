package com.staysphere.backend.repository;

import com.staysphere.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByHotelOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("{ 'room': ?0, 'status': { $nin: ['Cancelled', 'CANCELLED', 'Refunded', 'REFUNDED'] }, 'checkIn': { $lt: ?2 }, 'checkOut': { $gt: ?1 } }")
    Long countOverlappingBookings(String roomId, java.time.LocalDate checkin, java.time.LocalDate checkout);
}
