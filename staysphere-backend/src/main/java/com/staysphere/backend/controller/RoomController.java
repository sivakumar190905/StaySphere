package com.staysphere.backend.controller;

import com.staysphere.backend.dto.RoomDto;
import com.staysphere.backend.dto.RoomNumberDto;
import com.staysphere.backend.mapper.DtoMapper;
import com.staysphere.backend.model.Room;
import com.staysphere.backend.model.RoomNumber;
import com.staysphere.backend.repository.RoomRepository;
import com.staysphere.backend.repository.RoomNumberRepository;
import com.staysphere.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomNumberRepository roomNumberRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<RoomDto>> getRoomsByHotel(
            @PathVariable String hotelId,
            @RequestParam(required = false) String checkin,
            @RequestParam(required = false) String checkout) {
        
        List<Room> rooms = roomRepository.findByHotelIdAndStatus(hotelId, "AVAILABLE");
        
        java.time.LocalDate checkinDate = null;
        java.time.LocalDate checkoutDate = null;
        try {
            if (checkin != null && !checkin.trim().isEmpty() && !"undefined".equalsIgnoreCase(checkin) && !"null".equalsIgnoreCase(checkin)) {
                checkinDate = java.time.LocalDate.parse(checkin.trim());
            }
        } catch (Exception e) {
            System.err.println("Invalid checkin date: " + checkin);
        }
        try {
            if (checkout != null && !checkout.trim().isEmpty() && !"undefined".equalsIgnoreCase(checkout) && !"null".equalsIgnoreCase(checkout)) {
                checkoutDate = java.time.LocalDate.parse(checkout.trim());
            }
        } catch (Exception e) {
            System.err.println("Invalid checkout date: " + checkout);
        }

        final java.time.LocalDate finalCheckinDate = checkinDate;
        final java.time.LocalDate finalCheckoutDate = checkoutDate;

        List<RoomDto> list = rooms.stream()
                .map(room -> {
                    RoomDto dto = DtoMapper.toRoomDto(room);
                    // Fetch physical room numbers
                    List<RoomNumber> rns = roomNumberRepository.findByRoomId(room.getId());
                    List<RoomNumberDto> rnDtos = rns.stream()
                            .map(DtoMapper::toRoomNumberDto)
                            .collect(Collectors.toList());
                    dto.setRoomNumbers(rnDtos);

                    // Dynamic availability calculation based on dates
                    if (finalCheckinDate != null && finalCheckoutDate != null) {
                        Long bookedCountVal = bookingRepository.countOverlappingBookings(room.getId(), finalCheckinDate, finalCheckoutDate);
                        long bookedCount = bookedCountVal != null ? bookedCountVal : 0L;
                        long totalRooms = rns.isEmpty() ? (room.getAvailableCount() != null ? room.getAvailableCount() : 5) : rns.size();
                        long available = totalRooms - bookedCount;
                        dto.setAvailableCount((int) Math.max(0, available));
                    } else {
                        dto.setAvailableCount(rns.isEmpty() ? (room.getAvailableCount() != null ? room.getAvailableCount() : 5) : rns.size());
                    }
                    return dto;
                })
                .filter(roomDto -> roomDto.getAvailableCount() != null && roomDto.getAvailableCount() > 0)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(list);
    }
}
