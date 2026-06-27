package com.staysphere.backend.controller;

import com.staysphere.backend.dto.BookingDto;
import com.staysphere.backend.security.UserDetailsImpl;
import com.staysphere.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(
            @RequestBody BookingDto bookingDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        BookingDto created = bookingService.createBooking(bookingDto, userDetails.getId());
        return ResponseEntity.ok(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDto>> getMyBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingDto> bookings = bookingService.getMyBookings(userDetails.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/partner")
    @PreAuthorize("hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingDto>> getPartnerBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingDto> bookings = bookingService.getPartnerBookings(userDetails.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        List<BookingDto> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingDto> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        BookingDto cancelled = bookingService.cancelBooking(id, userDetails.getId());
        return ResponseEntity.ok(cancelled);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PARTNER') or hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<BookingDto> updateBookingStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String roomNumber) {
        BookingDto updated = bookingService.updateBookingStatus(id, status, roomNumber);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDto> updateBooking(
            @PathVariable String id,
            @RequestBody BookingDto bookingDto) {
        BookingDto updated = bookingService.updateBooking(id, bookingDto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable String id) {
        BookingDto booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }
}
