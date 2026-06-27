package com.staysphere.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {
    private String id;
    private String guestName;
    private String avatar; // optional, can default to first letter in UI
    private Double rating;
    private LocalDate date;
    private String comment;
    private String positivePoints;
    private String negativePoints;
}
