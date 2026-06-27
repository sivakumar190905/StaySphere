package com.staysphere.backend.service;

import com.staysphere.backend.dto.BookingDto;
import java.util.List;

public interface BookingService {
    BookingDto createBooking(BookingDto bookingDto, Long userId);
    List<BookingDto> getMyBookings(Long userId);
    List<BookingDto> getPartnerBookings(Long ownerId);
    List<BookingDto> getAllBookings();
    BookingDto cancelBooking(String bookingId, Long userId);
    BookingDto updateBookingStatus(String bookingId, String status, String roomNumber);
    BookingDto updateBooking(String bookingId, BookingDto bookingDto);
    BookingDto getBookingById(String bookingId);
}
