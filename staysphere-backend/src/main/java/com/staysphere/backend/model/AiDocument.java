package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "aiDocuments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiDocument {
    @Id
    private String id;
    private String title;
    private String content;
    private String type; // e.g. "Hotel Document", "FAQ"
}
