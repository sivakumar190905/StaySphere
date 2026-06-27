package com.staysphere.backend.repository;

import com.staysphere.backend.model.GuestRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface GuestRequestRepository extends MongoRepository<GuestRequest, Long> {
    
    default List<GuestRequest> findByBookingId(String bookingId) {
        return findAll().stream()
                .filter(req -> req.getBooking() != null && bookingId.equals(req.getBooking().getId()))
                .collect(Collectors.toList());
    }

    default List<GuestRequest> findByBookingHotelOwnerId(Long ownerId) {
        return findAll().stream()
                .filter(req -> req.getBooking() != null 
                        && req.getBooking().getHotel() != null 
                        && req.getBooking().getHotel().getOwner() != null 
                        && ownerId.equals(req.getBooking().getHotel().getOwner().getId()))
                .collect(Collectors.toList());
    }

    default List<GuestRequest> findByBookingHotelId(String hotelId) {
        return findAll().stream()
                .filter(req -> req.getBooking() != null 
                        && req.getBooking().getHotel() != null 
                        && hotelId.equals(req.getBooking().getHotel().getId()))
                .collect(Collectors.toList());
    }
}
