package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "wishlist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {
    @Id
    private String id;
    
    private Long userId;
    
    @DocumentReference(lazy = true)
    @Builder.Default
    private List<Hotel> favoriteHotels = new ArrayList<>();
}
