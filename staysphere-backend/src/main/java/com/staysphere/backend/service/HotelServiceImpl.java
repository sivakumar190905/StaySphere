package com.staysphere.backend.service;

import com.staysphere.backend.dto.HotelDto;
import com.staysphere.backend.dto.RoomDto;
import com.staysphere.backend.dto.RoomNumberDto;
import com.staysphere.backend.dto.ReviewDto;
import com.staysphere.backend.exception.ResourceNotFoundException;
import com.staysphere.backend.mapper.DtoMapper;
import com.staysphere.backend.model.Hotel;
import com.staysphere.backend.model.Room;
import com.staysphere.backend.model.RoomNumber;
import com.staysphere.backend.model.User;
import com.staysphere.backend.repository.HotelRepository;
import com.staysphere.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HotelServiceImpl implements HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.staysphere.backend.repository.BookingRepository bookingRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private com.staysphere.backend.repository.RoomRepository roomRepository;

    @Autowired
    private com.staysphere.backend.repository.RoomNumberRepository roomNumberRepository;

    @Override
    public List<HotelDto> searchHotels(String city, Integer stars, Double minPrice, Double maxPrice, String search) {
        Query query = new Query();
        
        if (city != null && !city.trim().isEmpty()) {
            query.addCriteria(Criteria.where("city").regex("^" + java.util.regex.Pattern.quote(city.trim()) + "$", "i"));
        }
        if (stars != null) {
            query.addCriteria(Criteria.where("stars").is(stars));
        }
        if (minPrice != null && maxPrice != null) {
            query.addCriteria(Criteria.where("basePrice").gte(minPrice).lte(maxPrice));
        } else if (minPrice != null) {
            query.addCriteria(Criteria.where("basePrice").gte(minPrice));
        } else if (maxPrice != null) {
            query.addCriteria(Criteria.where("basePrice").lte(maxPrice));
        }
        if (search != null && !search.trim().isEmpty()) {
            String searchRegex = ".*" + java.util.regex.Pattern.quote(search.trim()) + ".*";
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("name").regex(searchRegex, "i"),
                Criteria.where("description").regex(searchRegex, "i")
            );
            query.addCriteria(searchCriteria);
        }
        
        List<Hotel> hotels = mongoTemplate.find(query, Hotel.class);
        return hotels.stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    private void populateRooms(HotelDto dto) {
        if (dto == null) return;
        List<Room> rooms = roomRepository.findByHotelId(dto.getId());
        List<RoomDto> roomDtos = rooms.stream()
                .map(DtoMapper::toRoomDto)
                .collect(Collectors.toList());
        dto.setRooms(roomDtos);

        int totalRoomsCount = roomDtos.size();
        int availableRoomsCount = roomDtos.stream()
                .mapToInt(r -> r.getAvailableCount() != null ? r.getAvailableCount() : 0)
                .sum();

        System.out.println("Hotel: " + dto.getName());
        System.out.println("Total Rooms: " + totalRoomsCount);
        System.out.println("Available Rooms: " + availableRoomsCount);

        if (availableRoomsCount == 0) {
            dto.setHasRooms(false);
            dto.setMessage("No Rooms Available");
        } else {
            dto.setHasRooms(true);
            dto.setMessage(null);
        }
    }

    @Override
    public HotelDto getHotelById(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        HotelDto dto = DtoMapper.toHotelDto(hotel);
        populateRooms(dto);
        return dto;
    }

    @Override
    public HotelDto createHotel(HotelDto hotelDto, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        Hotel hotel = Hotel.builder()
                .id(hotelDto.getId() != null ? hotelDto.getId() : "h-" + java.util.UUID.randomUUID().toString().substring(0, 8))
                .name(hotelDto.getName())
                .city(hotelDto.getCity())
                .country(hotelDto.getCountry())
                .address(hotelDto.getAddress())
                .stars(hotelDto.getStars() != null ? hotelDto.getStars() : 5)
                .rating(5.0)
                .reviewCount(0)
                .description(hotelDto.getDescription())
                .basePrice(hotelDto.getBasePrice())
                .tag(hotelDto.getTag())
                .featured(hotelDto.getFeatured() != null ? hotelDto.getFeatured() : false)
                .owner(owner)
                .images(hotelDto.getImages() != null ? hotelDto.getImages() : new java.util.ArrayList<>())
                .amenities(hotelDto.getAmenities() != null ? hotelDto.getAmenities() : new java.util.ArrayList<>())
                .build();

        Hotel savedHotel = hotelRepository.save(hotel);
        final String finalHotelId = savedHotel.getId();
        if (hotelDto.getRooms() != null && !hotelDto.getRooms().isEmpty()) {
            List<Room> rooms = hotelDto.getRooms().stream().map(roomDto -> {
                Room room = Room.builder()
                        .id(roomDto.getId() != null ? roomDto.getId() : finalHotelId + "-r-" + java.util.UUID.randomUUID().toString().substring(0, 4))
                        .hotelId(finalHotelId)
                        .roomType(roomDto.getName() != null ? roomDto.getName() : "Standard Room")
                        .roomNumber(roomDto.getRoomNumbers() != null && !roomDto.getRoomNumbers().isEmpty() ? roomDto.getRoomNumbers().get(0).getNumber() : "101")
                        .description("Comfortable stay in " + (roomDto.getName() != null ? roomDto.getName() : "Standard Room"))
                        .maxGuests(roomDto.getCapacity() != null ? roomDto.getCapacity().getGuests() : 2)
                        .bedType((roomDto.getCapacity() != null ? roomDto.getCapacity().getBeds() : 1) + " King Bed")
                        .roomSize(roomDto.getSizeSqFt() != null ? roomDto.getSizeSqFt() : 400)
                        .pricePerNight(roomDto.getPrice())
                        .availableCount(roomDto.getRoomNumbers() != null ? roomDto.getRoomNumbers().size() : 5)
                        .status(roomDto.getStatus() != null ? roomDto.getStatus().toUpperCase() : "AVAILABLE")
                        .images(roomDto.getImages() != null ? roomDto.getImages() : new java.util.ArrayList<>())
                        .amenities(roomDto.getAmenities() != null ? roomDto.getAmenities() : new java.util.ArrayList<>())
                        .build();
                roomRepository.save(room);

                // Seed physical RoomNumber entities
                int roomCount = roomDto.getRoomNumbers() != null ? roomDto.getRoomNumbers().size() : 5;
                for (int j = 0; j < roomCount; j++) {
                    String number = (roomDto.getRoomNumbers() != null && roomDto.getRoomNumbers().size() > j) 
                            ? roomDto.getRoomNumbers().get(j).getNumber() 
                            : String.valueOf(101 + j);
                    RoomNumber rn = RoomNumber.builder()
                            .id(com.staysphere.backend.config.IdGenerator.nextId())
                            .room(room)
                            .number(number)
                            .status("Available")
                            .build();
                    roomNumberRepository.save(rn);
                }
                return room;
            }).collect(Collectors.toList());
            savedHotel.setRooms(rooms);
            savedHotel = hotelRepository.save(savedHotel);
        } else if (savedHotel.getTag() == null || !"Pending Approval".equalsIgnoreCase(savedHotel.getTag())) {
            generateAndSave5RoomCategories(savedHotel.getId(), savedHotel.getBasePrice());
            savedHotel = hotelRepository.findById(savedHotel.getId()).orElse(savedHotel);
        }
        HotelDto resultDto = DtoMapper.toHotelDto(savedHotel);
        populateRooms(resultDto);
        return resultDto;
    }

    @Override
    public HotelDto updateHotel(String id, HotelDto hotelDto) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        hotel.setName(hotelDto.getName());
        hotel.setCity(hotelDto.getCity());
        hotel.setCountry(hotelDto.getCountry());
        hotel.setAddress(hotelDto.getAddress());
        if (hotelDto.getStars() != null) hotel.setStars(hotelDto.getStars());
        hotel.setDescription(hotelDto.getDescription());
        hotel.setBasePrice(hotelDto.getBasePrice());
        hotel.setTag(hotelDto.getTag());
        if (hotelDto.getFeatured() != null) hotel.setFeatured(hotelDto.getFeatured());
        if (hotelDto.getImages() != null) hotel.setImages(hotelDto.getImages());
        if (hotelDto.getAmenities() != null) hotel.setAmenities(hotelDto.getAmenities());

        Hotel savedHotel = hotelRepository.save(hotel);
        HotelDto result = DtoMapper.toHotelDto(savedHotel);
        populateRooms(result);
        return result;
    }

    @Override
    public void deleteHotel(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        hotelRepository.delete(hotel);
    }

    @Override
    public void approveHotel(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        if ("Pending Approval".equalsIgnoreCase(hotel.getTag())) {
            hotel.setTag(null);
            hotelRepository.save(hotel);
        }
        
        // Seed default room categories on approval if empty
        if (roomRepository.findByHotelId(id).isEmpty()) {
            generateAndSave5RoomCategories(id, hotel.getBasePrice());
        }
    }

    @Override
    public List<HotelDto> getFeaturedHotels() {
        return hotelRepository.findByFeaturedTrue().stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<HotelDto> getPartnerHotels(Long ownerId) {
        return hotelRepository.findByOwnerId(ownerId).stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<HotelDto> getFavorites(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getFavoriteHotels().stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    @Override
    public void toggleFavorite(Long userId, String hotelId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        if (user.getFavoriteHotels().stream().anyMatch(h -> h.getId().equals(hotelId))) {
            user.getFavoriteHotels().removeIf(h -> h.getId().equals(hotelId));
        } else {
            user.getFavoriteHotels().add(hotel);
        }
        userRepository.save(user);
    }

    @Override
    public List<HotelDto> searchAvailableHotels(String city, java.time.LocalDate checkin, java.time.LocalDate checkout, Integer guests, Double price, Double rating, List<String> amenities) {
        List<Hotel> allHotels = hotelRepository.findAll();

        return allHotels.stream()
                .filter(hotel -> {
                    if (city != null && !city.trim().isEmpty()) {
                        if (hotel.getCity() == null || !hotel.getCity().equalsIgnoreCase(city.trim())) {
                            return false;
                        }
                    }
                    if (price != null && price > 0) {
                        if (hotel.getBasePrice() == null || hotel.getBasePrice() > price) {
                            return false;
                        }
                    }
                    if (rating != null && rating > 0) {
                        if (hotel.getRating() == null || hotel.getRating() < rating) {
                            return false;
                        }
                    }
                    if (amenities != null && !amenities.isEmpty()) {
                        if (hotel.getAmenities() == null) return false;
                        boolean hasAll = hotel.getAmenities().stream()
                                .map(String::toLowerCase)
                                .collect(Collectors.toSet())
                                .containsAll(amenities.stream().map(String::toLowerCase).collect(Collectors.toList()));
                        if (!hasAll) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(hotel -> {
                    HotelDto dto = DtoMapper.toHotelDto(hotel);
                    populateRooms(dto);
                    if (dto.getRooms() == null) return dto;

                    List<RoomDto> availableRooms = dto.getRooms().stream()
                            .filter(roomDto -> {
                                if (guests != null && guests > 0) {
                                    if (roomDto.getCapacity() == null || roomDto.getCapacity().getGuests() < guests) {
                                        return false;
                                    }
                                }
                                if (price != null && price > 0) {
                                    if (roomDto.getPrice() > price) {
                                        return false;
                                    }
                                }
                                if (checkin != null && checkout != null) {
                                    Long bookedCountVal = bookingRepository.countOverlappingBookings(roomDto.getId(), checkin, checkout);
                                    long bookedCount = bookedCountVal != null ? bookedCountVal : 0L;
                                    long totalRooms = (roomDto.getRoomNumbers() != null && !roomDto.getRoomNumbers().isEmpty()) 
                                            ? roomDto.getRoomNumbers().size() 
                                            : (roomDto.getAvailableCount() != null ? roomDto.getAvailableCount() : 0);
                                    long available = totalRooms - bookedCount;
                                    roomDto.setAvailableCount((int) Math.max(0, available));
                                    return bookedCount < totalRooms;
                                }
                                return true;
                            })
                            .collect(Collectors.toList());

                    dto.setRooms(availableRooms);
                    if (!availableRooms.isEmpty()) {
                        dto.setBasePrice(availableRooms.stream().mapToDouble(RoomDto::getPrice).min().orElse(dto.getBasePrice()));
                    }
                    return dto;
                })
                .filter(hotelDto -> hotelDto.getRooms() != null && !hotelDto.getRooms().isEmpty())
                .collect(Collectors.toList());
    }

    public void generateAndSave5RoomCategories(String hotelId, Double basePrice) {
        double base = basePrice != null ? basePrice : 3500.0;
        
        Object[][] categories = {
            {"Standard", "Cozy standard room with all basic amenities.", 2, "Queen Bed", 280, base, 5, "/images/rooms/standard.jpg"},
            {"Deluxe", "Spacious deluxe room with premium fittings and a working space.", 2, "King Bed", 380, base * 1.3, 4, "/images/rooms/deluxe.jpg"},
            {"Premium", "Elegant premium room boasting stunning views and luxury bath amenities.", 3, "King Bed", 480, base * 1.7, 3, "/images/rooms/cityView.jpg"},
            {"Executive Suite", "Ultra-luxurious executive suite with a separate living lounge.", 4, "King Bed + Sofa Bed", 780, base * 2.5, 2, "/images/rooms/executiveSuite.jpg"},
            {"Presidential Suite", "The pinnacle of grand luxury with a private terrace and personal butler.", 6, "2 King Beds", 1800, base * 5.0, 1, "/images/rooms/presidentialSuite.jpg"}
        };

        java.util.List<Room> createdRooms = new java.util.ArrayList<>();
        for (int i = 0; i < categories.length; i++) {
            Object[] cat = categories[i];
            String type = (String) cat[0];
            String desc = (String) cat[1];
            int guests = (Integer) cat[2];
            String bed = (String) cat[3];
            int size = (Integer) cat[4];
            double price = Math.round((Double) cat[5]);
            int count = (Integer) cat[6];
            String img = (String) cat[7];

            String roomId = hotelId + "_" + type.toLowerCase().replace(" ", "_");
            
            if (!roomRepository.existsById(roomId)) {
                Room room = Room.builder()
                        .id(roomId)
                        .hotelId(hotelId)
                        .roomType(type)
                        .roomNumber(String.valueOf(101 + i * 100))
                        .description(desc)
                        .maxGuests(guests)
                        .bedType(bed)
                        .roomSize(size)
                        .pricePerNight(price)
                        .availableCount(count)
                        .status("AVAILABLE")
                        .images(java.util.List.of(img))
                        .amenities(java.util.List.of("Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Mini Fridge", "Espresso Machine"))
                        .build();
                roomRepository.save(room);
                createdRooms.add(room);

                // Seed physical RoomNumber entities
                for (int j = 0; j < count; j++) {
                    RoomNumber rn = RoomNumber.builder()
                            .id(com.staysphere.backend.config.IdGenerator.nextId())
                            .room(room)
                            .number(String.valueOf(101 + i * 100 + j))
                            .status("Available")
                            .build();
                    roomNumberRepository.save(rn);
                }
            }
        }
        
        if (!createdRooms.isEmpty()) {
            hotelRepository.findById(hotelId).ifPresent(hotel -> {
                hotel.getRooms().addAll(createdRooms);
                hotelRepository.save(hotel);
            });
        }
    }
}
