package com.staysphere.backend.repository;

import com.staysphere.backend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    
    default List<Payment> findByBookingId(String bookingId) {
        return findAll().stream()
                .filter(p -> p.getBooking() != null && bookingId.equals(p.getBooking().getId()))
                .collect(Collectors.toList());
    }
}
