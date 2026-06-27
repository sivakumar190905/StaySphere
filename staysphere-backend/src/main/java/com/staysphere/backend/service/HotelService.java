package com.staysphere.backend.service;

import com.staysphere.backend.dto.HotelDto;
import java.util.List;

public interface HotelService {
    List<HotelDto> searchHotels(String city, Integer stars, Double minPrice, Double maxPrice, String search);
    List<HotelDto> searchAvailableHotels(String city, java.time.LocalDate checkin, java.time.LocalDate checkout, Integer guests, Double price, Double rating, List<String> amenities);
    HotelDto getHotelById(String id);
    HotelDto createHotel(HotelDto hotelDto, Long ownerId);
    HotelDto updateHotel(String id, HotelDto hotelDto);
    void deleteHotel(String id);
    void approveHotel(String id);
    List<HotelDto> getFeaturedHotels();
    List<HotelDto> getPartnerHotels(Long ownerId);
    List<HotelDto> getFavorites(Long userId);
    void toggleFavorite(Long userId, String hotelId);
}
