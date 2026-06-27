package com.staysphere.backend.repository;

import com.staysphere.backend.model.ChatHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatHistoryRepository extends MongoRepository<ChatHistory, String> {
    List<ChatHistory> findByUserEmailOrderByTimestampDesc(String userEmail);
}
