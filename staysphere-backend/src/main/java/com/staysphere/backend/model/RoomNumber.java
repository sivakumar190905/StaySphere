package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

@Document(collection = "roomNumbers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomNumber {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    private Room room;

    private String number;

    @Builder.Default
    private String status = "Available"; // 'Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked'
}
