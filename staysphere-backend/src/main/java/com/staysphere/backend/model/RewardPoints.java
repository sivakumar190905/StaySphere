package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "rewardPoints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardPoints {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    private User user;

    @Builder.Default
    private Integer points = 0;

    private String transactionType; // 'EARNED', 'REDEEMED'

    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
