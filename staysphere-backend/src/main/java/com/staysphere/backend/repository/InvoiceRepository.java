package com.staysphere.backend.repository;

import com.staysphere.backend.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    
    default Optional<Invoice> findByBookingId(String bookingId) {
        return findAll().stream()
                .filter(i -> i.getBooking() != null && bookingId.equals(i.getBooking().getId()))
                .findFirst();
    }
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
