package com.staysphere.backend.repository;

import com.staysphere.backend.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    List<Room> findByHotelId(String hotelId);
    List<Room> findByHotelIdAndStatus(String hotelId, String status);
}
