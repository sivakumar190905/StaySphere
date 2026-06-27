package com.staysphere.backend.controller;

import com.staysphere.backend.dto.GuestRequestDto;
import com.staysphere.backend.dto.SupportTicketDto;
import com.staysphere.backend.model.*;
import com.staysphere.backend.repository.*;
import com.staysphere.backend.service.ActivityLogService;
import com.staysphere.backend.exception.ResourceNotFoundException;
import com.staysphere.backend.exception.BadRequestException;
import com.staysphere.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/business")
public class BusinessController {

    @Autowired
    private GuestRequestRepository guestRequestRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    private GuestRequestDto mapToRequestDto(GuestRequest req) {
        return GuestRequestDto.builder()
                .id(req.getId())
                .bookingId(req.getBooking() != null ? req.getBooking().getId() : null)
                .hotelName(req.getBooking() != null ? req.getBooking().getHotelName() : null)
                .roomNumber(req.getBooking() != null ? req.getBooking().getAssignedRoomNumber() : null)
                .requestType(req.getRequestType())
                .details(req.getDetails())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }

    private SupportTicketDto mapToTicketDto(SupportTicket ticket) {
        User u = ticket.getUser();
        return SupportTicketDto.builder()
                .id(ticket.getId())
                .userId(u != null ? u.getId() : null)
                .userEmail(u != null ? u.getEmail() : null)
                .userName(u != null ? u.getFirstName() + " " + u.getLastName() : null)
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .build();
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createGuestRequest(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String bookingId = payload.get("bookingId");
        String requestType = payload.get("requestType");
        String details = payload.get("details");

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        GuestRequest req = GuestRequest.builder()
                .booking(booking)
                .requestType(requestType)
                .details(details)
                .status("OPEN")
                .build();
        guestRequestRepository.save(req);

        activityLogService.logActivity(booking.getUser(), "Guest Request Created", "Created request '" + requestType + "' for reservation " + bookingId, null, "GuestRequest", String.valueOf(req.getId()));

        return ResponseEntity.ok(mapToRequestDto(req));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<GuestRequestDto>> getGuestRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<GuestRequest> requests;
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        if ("ROLE_CUSTOMER".equalsIgnoreCase(role)) {
            requests = guestRequestRepository.findAll().stream()
                    .filter(req -> req.getBooking() != null && req.getBooking().getUser() != null && req.getBooking().getUser().getId().equals(userDetails.getId()))
                    .collect(Collectors.toList());
        } else if ("ROLE_PARTNER".equalsIgnoreCase(role)) {
            requests = guestRequestRepository.findByBookingHotelOwnerId(userDetails.getId());
        } else {
            requests = guestRequestRepository.findAll();
        }

        List<GuestRequestDto> dtos = requests.stream()
                .map(this::mapToRequestDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/requests/{id}/status")
    public ResponseEntity<?> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        GuestRequest req = guestRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest request not found with id: " + id));

        req.setStatus(status);
        guestRequestRepository.save(req);

        activityLogService.logActivity(null, "Guest Request Updated", "Guest request status updated to " + status + " for request id " + id, null, "GuestRequest", String.valueOf(id));

        return ResponseEntity.ok(mapToRequestDto(req));
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> createSupportTicket(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String subject = payload.get("subject");
        String description = payload.get("description");
        String priority = payload.getOrDefault("priority", "MEDIUM");

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(subject)
                .description(description)
                .priority(priority)
                .status("OPEN")
                .build();
        supportTicketRepository.save(ticket);

        activityLogService.logActivity(user, "Support Ticket Created", "Support ticket created: '" + subject + "'", null, "SupportTicket", String.valueOf(ticket.getId()));

        return ResponseEntity.ok(mapToTicketDto(ticket));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketDto>> getSupportTickets(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<SupportTicket> tickets;
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        if ("ROLE_ADMIN".equalsIgnoreCase(role)) {
            tickets = supportTicketRepository.findAllByOrderByCreatedAtDesc();
        } else {
            tickets = supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        }

        List<SupportTicketDto> dtos = tickets.stream()
                .map(this::mapToTicketDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + id));

        ticket.setStatus(status);
        supportTicketRepository.save(ticket);

        if ("RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)) {
            activityLogService.logActivity(ticket.getUser(), "Support Ticket Resolved", "Support ticket id " + id + " marked as " + status, null, "SupportTicket", String.valueOf(id));
        }

        return ResponseEntity.ok(mapToTicketDto(ticket));
    }
}
