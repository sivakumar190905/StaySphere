package com.staysphere.backend.repository;

import com.staysphere.backend.model.MaintenanceTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public interface MaintenanceTicketRepository extends MongoRepository<MaintenanceTicket, Long> {
    List<MaintenanceTicket> findByStatus(String status);
    
    default List<MaintenanceTicket> findByRoomNumberId(Long roomNumberId) {
        return findAll().stream()
                .filter(t -> t.getRoomNumber() != null && roomNumberId.equals(t.getRoomNumber().getId()))
                .collect(Collectors.toList());
    }
}
