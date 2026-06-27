package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private Long id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String firstName;

    private String lastName;

    private String phone;

    private Role role;

    @Builder.Default
    private boolean emailVerified = false;

    @DocumentReference(lazy = true)
    @Builder.Default
    private List<Hotel> favoriteHotels = new ArrayList<>();

    private String avatar;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
