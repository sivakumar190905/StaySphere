package com.staysphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id; // custom ID, e.g. "STS-2026-00125"

    @DocumentReference(lazy = true)
    @Indexed
    private Hotel hotel;

    private String hotelName;

    private String hotelImage;

    @DocumentReference(lazy = true)
    private Room room;

    private String roomName;

    private LocalDate checkIn;

    private LocalDate checkOut;

    private Integer guests;

    private Integer roomsCount;

    private Double totalPrice;

    private String guestFullName;

    private String guestEmail;

    private String guestPhone;

    private String specialRequests;

    private String paymentMethod;

    @Builder.Default
    private String status = "Pending Approval"; // 'Pending Approval', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled', 'Refunded'

    private String couponCode;

    @Builder.Default
    private Double discountAmount = 0.0;

    @Builder.Default
    private Double cgst = 0.0;

    @Builder.Default
    private Double sgst = 0.0;

    private String gstCompany;

    private String gstin;

    private String assignedRoomNumber;

    private String qrCodeToken;

    @DocumentReference(lazy = true)
    @Indexed
    private User user;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
