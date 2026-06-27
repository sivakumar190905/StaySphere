package com.staysphere.backend.controller;

import com.staysphere.backend.dto.OperationalRoomDto;
import com.staysphere.backend.dto.MaintenanceTicketDto;
import com.staysphere.backend.model.RoomNumber;
import com.staysphere.backend.model.MaintenanceTicket;
import com.staysphere.backend.repository.RoomNumberRepository;
import com.staysphere.backend.repository.MaintenanceTicketRepository;
import com.staysphere.backend.repository.HotelRepository;
import com.staysphere.backend.service.ActivityLogService;
import com.staysphere.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operations")
@PreAuthorize("hasRole('STAFF') or hasRole('PARTNER') or hasRole('ADMIN')")
public class OperationalController {

    @Autowired
    private RoomNumberRepository roomNumberRepository;

    @Autowired
    private MaintenanceTicketRepository maintenanceTicketRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private HotelRepository hotelRepository;

    private OperationalRoomDto mapToRoomDto(RoomNumber rn) {
        String hotelId = null;
        String hotelName = null;
        if (rn.getRoom() != null) {
            hotelId = rn.getRoom().getHotelId();
            if (hotelId != null) {
                hotelName = hotelRepository.findById(hotelId)
                        .map(com.staysphere.backend.model.Hotel::getName)
                        .orElse(null);
            }
        }

        return OperationalRoomDto.builder()
                .id(rn.getId())
                .number(rn.getNumber())
                .status(rn.getStatus())
                .roomId(rn.getRoom() != null ? rn.getRoom().getId() : null)
                .roomName(rn.getRoom() != null ? rn.getRoom().getRoomType() : null)
                .hotelId(hotelId)
                .hotelName(hotelName)
                .build();
    }

    private MaintenanceTicketDto mapToTicketDto(MaintenanceTicket ticket) {
        RoomNumber rn = ticket.getRoomNumber();
        String hotelName = null;
        if (rn != null && rn.getRoom() != null && rn.getRoom().getHotelId() != null) {
            hotelName = hotelRepository.findById(rn.getRoom().getHotelId())
                    .map(com.staysphere.backend.model.Hotel::getName)
                    .orElse(null);
        }

        return MaintenanceTicketDto.builder()
                .id(ticket.getId())
                .roomNumberId(rn != null ? rn.getId() : null)
                .roomNumber(rn != null ? rn.getNumber() : null)
                .roomName(rn != null && rn.getRoom() != null ? rn.getRoom().getRoomType() : null)
                .hotelName(hotelName)
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .build();
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<OperationalRoomDto>> getAllRoomNumbers() {
        List<OperationalRoomDto> list = roomNumberRepository.findAll().stream()
                .map(this::mapToRoomDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/housekeeping")
    public ResponseEntity<List<OperationalRoomDto>> getHousekeepingQueue() {
        List<OperationalRoomDto> cleaningRooms = roomNumberRepository.findAll().stream()
                .filter(rn -> "Cleaning".equalsIgnoreCase(rn.getStatus()))
                .map(this::mapToRoomDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cleaningRooms);
    }

    @PutMapping("/housekeeping/resolve")
    public ResponseEntity<?> resolveCleaning(@RequestParam Long roomNumberId) {
        RoomNumber rn = roomNumberRepository.findById(roomNumberId)
                .orElseThrow(() -> new ResourceNotFoundException("Room number not found with id: " + roomNumberId));

        rn.setStatus("Available");
        roomNumberRepository.save(rn);

        String roomNameStr = rn.getRoom() != null ? rn.getRoom().getRoomType() : "Unknown Category";
        activityLogService.logActivity(null, "Room Cleaned", "Room " + rn.getNumber() + " (" + roomNameStr + ") cleaned and marked Available.", null, "RoomNumber", String.valueOf(roomNumberId));

        return ResponseEntity.ok(Map.of("message", "Room " + rn.getNumber() + " marked as Available again."));
    }

    @PostMapping("/maintenance")
    public ResponseEntity<?> createMaintenanceTicket(@RequestBody Map<String, Object> payload) {
        Long roomNumberId = Long.valueOf(payload.get("roomNumberId").toString());
        String description = payload.get("description").toString();

        RoomNumber rn = roomNumberRepository.findById(roomNumberId)
                .orElseThrow(() -> new ResourceNotFoundException("Room number not found with id: " + roomNumberId));

        rn.setStatus("Maintenance");
        roomNumberRepository.save(rn);

        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .roomNumber(rn)
                .description(description)
                .status("OPEN")
                .build();
        maintenanceTicketRepository.save(ticket);

        activityLogService.logActivity(null, "Maintenance Ticket Opened", "Room " + rn.getNumber() + " blocked for maintenance. Reason: " + description, null, "RoomNumber", String.valueOf(roomNumberId));

        return ResponseEntity.ok(Map.of(
                "message", "Maintenance ticket created and room " + rn.getNumber() + " blocked.",
                "ticketId", ticket.getId()
        ));
    }

    @PutMapping("/maintenance/resolve/{ticketId}")
    public ResponseEntity<?> resolveMaintenance(@PathVariable Long ticketId) {
        MaintenanceTicket ticket = maintenanceTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance ticket not found with id: " + ticketId));

        ticket.setStatus("RESOLVED");
        maintenanceTicketRepository.save(ticket);

        RoomNumber rn = ticket.getRoomNumber();
        if (rn != null) {
            rn.setStatus("Available");
            roomNumberRepository.save(rn);
            activityLogService.logActivity(null, "Maintenance Resolved", "Maintenance ticket resolved for Room " + rn.getNumber(), null, "RoomNumber", String.valueOf(rn.getId()));
        }

        return ResponseEntity.ok(Map.of("message", "Maintenance resolved successfully. Room " + (rn != null ? rn.getNumber() : "") + " is now Available."));
    }

    @GetMapping("/maintenance")
    public ResponseEntity<List<MaintenanceTicketDto>> getMaintenanceTickets() {
        List<MaintenanceTicketDto> list = maintenanceTicketRepository.findAll().stream()
                .map(this::mapToTicketDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
