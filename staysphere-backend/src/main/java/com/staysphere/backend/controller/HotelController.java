package com.staysphere.backend.controller;

import com.staysphere.backend.dto.HotelDto;
import com.staysphere.backend.security.UserDetailsImpl;
import com.staysphere.backend.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelDto>> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer stars,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String search) {
        
        List<HotelDto> hotels = hotelService.searchHotels(city, stars, minPrice, maxPrice, search);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/search")
    public ResponseEntity<List<HotelDto>> searchAvailableHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String checkin,
            @RequestParam(required = false) String checkout,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) List<String> amenities) {
        
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
        
        List<HotelDto> hotels = hotelService.searchAvailableHotels(city, checkinDate, checkoutDate, guests, price, rating, amenities);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<HotelDto>> getFeaturedHotels() {
        return ResponseEntity.ok(hotelService.getFeaturedHotels());
    }

    @GetMapping("/partner")
    @PreAuthorize("hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<List<HotelDto>> getPartnerHotels(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(hotelService.getPartnerHotels(userDetails.getId()));
    }

    @GetMapping("/favorites")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<List<HotelDto>> getFavoriteHotels(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(hotelService.getFavorites(userDetails.getId()));
    }

    @PostMapping("/{id}/favorite")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleFavorite(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        hotelService.toggleFavorite(userDetails.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Favorite status toggled successfully!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDto> getHotelById(@PathVariable String id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<HotelDto> createHotel(
            @RequestBody HotelDto hotelDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        HotelDto created = hotelService.createHotel(hotelDto, userDetails.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<HotelDto> updateHotel(
            @PathVariable String id,
            @RequestBody HotelDto hotelDto) {
        HotelDto updated = hotelService.updateHotel(id, hotelDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteHotel(@PathVariable String id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok(Map.of("message", "Hotel deleted successfully!"));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveHotel(@PathVariable String id) {
        hotelService.approveHotel(id);
        return ResponseEntity.ok(Map.of("message", "Hotel approved successfully!"));
    }
}
