package com.staysphere.backend.repository;

import com.staysphere.backend.model.AiDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiDocumentRepository extends MongoRepository<AiDocument, String> {
}
