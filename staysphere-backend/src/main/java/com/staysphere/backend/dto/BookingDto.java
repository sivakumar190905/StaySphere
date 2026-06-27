package com.staysphere.backend.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDto {
    private String id;
    private String hotelId;
    private String hotelName;
    private String hotelImage;
    private String roomId;
    private String roomName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private Integer rooms; // map to rooms_count in DB
    private Double totalPrice;
    private GuestDetails guestDetails;
    private String paymentMethod;
    private String status; // 'Pending Approval' | 'Confirmed' etc.
    private LocalDateTime createdAt;
    private String couponCode;
    private Double discountAmount;
    private Double cgst;
    private Double sgst;
    private String gstCompany;
    private String gstin;
    private String assignedRoomNumber;
    private String qrCodeToken;
    private Long userId;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestDetails {
        private String fullName;
        private String email;
        private String phone;
        private String specialRequests;
    }
}
