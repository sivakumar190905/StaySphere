package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "travelGuides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelGuide {
    @Id
    private String id;
    private String destination;
    private String description;
    private String recommendations;
}
