package com.staysphere.backend.mapper;

import com.staysphere.backend.dto.*;
import com.staysphere.backend.model.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {

    public static UserProfileDto toUserProfileDto(User user) {
        if (user == null) return null;
        return UserProfileDto.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    public static RoomNumberDto toRoomNumberDto(RoomNumber rn) {
        if (rn == null) return null;
        return RoomNumberDto.builder()
                .number(rn.getNumber())
                .status(rn.getStatus())
                .build();
    }

    public static RoomDto toRoomDto(Room room) {
        if (room == null) return null;

        String typeStr = "standard";
        if (room.getRoomType() != null) {
            String rt = room.getRoomType().toLowerCase();
            if (rt.contains("suite")) typeStr = "suite";
            else if (rt.contains("deluxe")) typeStr = "deluxe";
            else if (rt.contains("family") || rt.contains("villa")) typeStr = "family";
        }

        int available = room.getAvailableCount() != null ? room.getAvailableCount() : 0;
        int beds = 1;
        if (room.getMaxGuests() != null) {
            beds = Math.max(1, room.getMaxGuests() / 2);
        }

        String statusMapped = "Available";
        if (room.getStatus() != null) {
            String s = room.getStatus().toUpperCase();
            if (s.equals("AVAILABLE")) statusMapped = "Available";
            else if (s.equals("RESERVED")) statusMapped = "Reserved";
            else if (s.equals("MAINTENANCE")) statusMapped = "Maintenance";
            else if (s.equals("OCCUPIED")) statusMapped = "Occupied";
            else statusMapped = room.getStatus();
        }

        return RoomDto.builder()
                .id(room.getId())
                .name(room.getRoomType())
                .type(typeStr)
                .price(room.getPricePerNight())
                .capacity(new RoomDto.Capacity(room.getMaxGuests(), beds))
                .amenities(room.getAmenities())
                .images(room.getImages())
                .availableCount(available)
                .sizeSqFt(room.getRoomSize())
                .status(statusMapped)
                .roomNumbers(new ArrayList<>())
                .build();
    }

    public static ReviewDto toReviewDto(Review review) {
        if (review == null) return null;
        return ReviewDto.builder()
                .id(review.getId())
                .guestName(review.getGuestName())
                .rating(review.getRating())
                .date(review.getDate())
                .comment(review.getComment())
                .positivePoints(review.getPositivePoints())
                .negativePoints(review.getNegativePoints())
                .build();
    }

    public static HotelDto toHotelDto(Hotel hotel) {
        return toHotelDto(hotel, false);
    }

    public static HotelDto toHotelDto(Hotel hotel, boolean includeRelations) {
        if (hotel == null) return null;

        List<RoomDto> roomDtos = new ArrayList<>();
        if (includeRelations && hotel.getRooms() != null) {
            roomDtos = hotel.getRooms().stream()
                    .map(DtoMapper::toRoomDto)
                    .collect(Collectors.toList());
        }

        List<ReviewDto> reviewDtos = new ArrayList<>();
        if (includeRelations && hotel.getReviews() != null) {
            reviewDtos = hotel.getReviews().stream()
                    .map(DtoMapper::toReviewDto)
                    .collect(Collectors.toList());
        }

        return HotelDto.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .address(hotel.getAddress())
                .stars(hotel.getStars())
                .rating(hotel.getRating())
                .reviewCount(hotel.getReviewCount())
                .description(hotel.getDescription())
                .images(hotel.getImages())
                .amenities(hotel.getAmenities())
                .basePrice(hotel.getBasePrice())
                .tag(hotel.getTag())
                .featured(hotel.getFeatured())
                .rooms(roomDtos)
                .reviews(reviewDtos)
                .ownerId(hotel.getOwner() != null ? hotel.getOwner().getId() : null)
                .build();
    }

    public static BookingDto toBookingDto(Booking booking) {
        if (booking == null) return null;

        BookingDto.GuestDetails details = BookingDto.GuestDetails.builder()
                .fullName(booking.getGuestFullName())
                .email(booking.getGuestEmail())
                .phone(booking.getGuestPhone())
                .specialRequests(booking.getSpecialRequests())
                .build();

        return BookingDto.builder()
                .id(booking.getId())
                .hotelId(booking.getHotel() != null ? booking.getHotel().getId() : null)
                .hotelName(booking.getHotelName())
                .hotelImage(booking.getHotelImage())
                .roomId(booking.getRoom() != null ? booking.getRoom().getId() : null)
                .roomName(booking.getRoomName())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .guests(booking.getGuests())
                .rooms(booking.getRoomsCount())
                .totalPrice(booking.getTotalPrice())
                .guestDetails(details)
                .paymentMethod(booking.getPaymentMethod())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .couponCode(booking.getCouponCode())
                .discountAmount(booking.getDiscountAmount())
                .cgst(booking.getCgst())
                .sgst(booking.getSgst())
                .gstCompany(booking.getGstCompany())
                .gstin(booking.getGstin())
                .assignedRoomNumber(booking.getAssignedRoomNumber())
                .qrCodeToken(booking.getQrCodeToken())
                .userId(booking.getUser().getId())
                .build();
    }

    public static NotificationDto toNotificationDto(Notification n) {
        if (n == null) return null;
        
        String friendlyTime = "Just now";
        if (n.getCreatedAt() != null) {
            java.time.Duration duration = java.time.Duration.between(n.getCreatedAt(), java.time.LocalDateTime.now());
            long minutes = duration.toMinutes();
            if (minutes > 0) {
                if (minutes < 60) {
                    friendlyTime = minutes + "m ago";
                } else {
                    long hours = duration.toHours();
                    if (hours < 24) {
                        friendlyTime = hours + "h ago";
                    } else {
                        friendlyTime = duration.toDays() + "d ago";
                    }
                }
            }
        }

        return NotificationDto.builder()
                .id(n.getId() != null ? String.valueOf(n.getId()) : "")
                .title(n.getTitle())
                .message(n.getMessage())
                .time(friendlyTime)
                .read(n.getIsRead())
                .build();
    }
}
