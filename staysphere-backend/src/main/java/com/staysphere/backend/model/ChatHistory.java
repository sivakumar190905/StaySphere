package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chatHistory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistory {
    @Id
    private String id;
    private String userEmail;
    private String message;
    private String response;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
