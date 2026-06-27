package com.staysphere.backend.repository;

import com.staysphere.backend.model.Room;
import com.staysphere.backend.model.RoomNumber;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomNumberRepository extends MongoRepository<RoomNumber, Long> {
    
    @Query("{ 'room': ?0 }")
    List<RoomNumber> findByRoomId(String roomId);

    @Query("{ 'room': ?0, 'number': ?1 }")
    Optional<RoomNumber> findByRoomIdAndNumber(String roomId, String number);
}
