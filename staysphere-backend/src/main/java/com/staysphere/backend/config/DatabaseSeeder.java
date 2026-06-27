package com.staysphere.backend.config;

import com.staysphere.backend.model.*;
import com.staysphere.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AiDocumentRepository aiDocumentRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private TravelGuideRepository travelGuideRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomNumberRepository roomNumberRepository;

    @Override
    public void run(String... args) throws Exception {
        // Clear collections for clean startup
        userRepository.deleteAll();
        hotelRepository.deleteAll();
        roomRepository.deleteAll();
        bookingRepository.deleteAll();
        notificationRepository.deleteAll();
        aiDocumentRepository.deleteAll();
        policyRepository.deleteAll();
        travelGuideRepository.deleteAll();
        roomNumberRepository.deleteAll();

        seedUsers();
        seedHotelsAndRoomsAndBookings();
        seedAiAssistantData();
        seedRoomsIfEmpty();
        seedRoomNumbersIfEmpty();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }

        String defaultPassHash = passwordEncoder.encode("staysphere123");

        User admin = User.builder()
                .id(1L)
                .firstName("System")
                .lastName("Administrator")
                .email("admin@staysphere.com")
                .phone("+91 99999-00001")
                .passwordHash(defaultPassHash)
                .role(Role.ADMIN)
                .build();

        User partner = User.builder()
                .id(2L)
                .firstName("Suresh")
                .lastName("Khanna")
                .email("suresh.owner@staysphere.com")
                .phone("+91 99999-00125")
                .passwordHash(defaultPassHash)
                .role(Role.PARTNER)
                .build();

        User staff = User.builder()
                .id(3L)
                .firstName("Priya")
                .lastName("Patel")
                .email("priya.staff@staysphere.com")
                .phone("+91 99999-00002")
                .passwordHash(defaultPassHash)
                .role(Role.STAFF)
                .build();

        User customer = User.builder()
                .id(4L)
                .firstName("Rohan")
                .lastName("Mehta")
                .email("rohan@example.com")
                .phone("+91 99999-00125")
                .passwordHash(defaultPassHash)
                .role(Role.CUSTOMER)
                .build();

        userRepository.saveAll(Arrays.asList(admin, partner, staff, customer));
    }

    private void seedHotelsAndRoomsAndBookings() {
        if (hotelRepository.count() > 0) {
            return;
        }

        User owner = userRepository.findByEmail("suresh.owner@staysphere.com").orElse(null);
        User customer = userRepository.findByEmail("rohan@example.com").orElse(null);

        Map<String, List<String>> cityHotelsMap = new LinkedHashMap<>();
        cityHotelsMap.put("Chennai", Arrays.asList("ITC Grand Chola", "Taj Club House", "The Leela Palace", "Hyatt Regency", "Radisson Blu", "Novotel Chennai", "Holiday Inn", "Park Hyatt", "Ramada Plaza", "Vivanta Chennai"));
        cityHotelsMap.put("Bangalore", Arrays.asList("Taj West End", "The Leela Palace", "ITC Gardenia", "JW Marriott", "Shangri-La", "Radisson Blu", "Hyatt Centric", "Vivanta Bengaluru", "Hilton Embassy", "Royal Orchid"));
        cityHotelsMap.put("Hyderabad", Arrays.asList("Taj Falaknuma Palace", "ITC Kohenur", "The Westin Mindspace", "Park Hyatt", "Trident Hyderabad", "Sheraton Hyderabad", "Novotel Hitec City", "Taj Krishna", "Hyatt Regency", "Radisson Blu Plaza"));
        cityHotelsMap.put("Mumbai", Arrays.asList("Taj Lands End", "The Taj Mahal Palace", "The Oberoi Mumbai", "JW Marriott Juhu", "Trident Nariman Point", "St. Regis Mumbai", "Sofitel BKC", "Grand Hyatt Mumbai", "The Leela Mumbai", "Vivanta President"));
        cityHotelsMap.put("Delhi", Arrays.asList("The Leela Palace", "Taj Mahal Hotel", "The Lodhi", "The Imperial", "Shangri-La Eros", "JW Marriott Aerocity", "Hyatt Regency", "Andaz Delhi", "The Claridges", "Radisson Blu Plaza"));
        cityHotelsMap.put("Pune", Arrays.asList("JW Marriott Pune", "Hyatt Regency", "Conrad Pune", "Sheraton Grand", "Ritz-Carlton Pune", "DoubleTree by Hilton", "Novotel Pune", "Radisson Blu", "Vivanta Pune", "Orchid Hotel"));
        cityHotelsMap.put("Goa", Arrays.asList("Taj Exotica Resort", "W Goa", "Alila Diwa Goa", "Grand Hyatt Goa", "The Leela Goa", "Caravela Beach Resort", "Cidade de Goa", "Kenilworth Resort", "Novotel Goa", "Radisson Blu Resort"));
        cityHotelsMap.put("Kochi", Arrays.asList("Brunton Boatyard", "Grand Hyatt Bolgatty", "Kochi Marriott", "Taj Malabar Resort", "Forte Kochi", "Le Meridien Kochi", "Fragrant Nature", "Ramada Resort", "Radisson Blu Kochi", "Trident Kochi"));
        cityHotelsMap.put("Jaipur", Arrays.asList("Rambagh Palace", "Taj Jai Mahal Palace", "The Oberoi Rajvilas", "ITC Rajputana", "Fairmont Jaipur", "Le Meridien Jaipur", "Marriott Jaipur", "Radisson Blu Jaipur", "Hilton Jaipur", "Alsisar Haveli"));
        cityHotelsMap.put("Udaipur", Arrays.asList("The Leela Palace Udaipur", "Taj Lake Palace", "The Oberoi Udaivilas", "Taj Aravali Resort", "Aurika Udaipur", "Raffles Udaipur", "Trident Udaipur", "Jagmandir Island Palace", "Mewargarh Palace", "Radisson Blu Udaipur"));
        cityHotelsMap.put("Pondicherry", Arrays.asList("Promenade Beach Resort", "Palais de Mahé", "La Villa", "Windflower Resort", "Shenbaga Hotel", "Ocean Spray", "Accord Puducherry", "Le Dupleix", "Villa Shanti", "Radisson Resort"));
        cityHotelsMap.put("Coimbatore", Arrays.asList("Radisson Blu", "Welcomhotel Coimbatore", "Vivanta Coimbatore", "The Residency Towers", "Le Meridien Coimbatore", "Fairfield by Marriott", "Hash Six Hotels", "Aloft Coimbatore", "Zone by The Park", "Ibis Coimbatore"));
        cityHotelsMap.put("Vellore", Arrays.asList("Fortune Park Vellore", "Regency Sameera", "Hotel Benz Park", "Darling Residency", "Khanna Fiesta", "Hotel SMS Grand", "Poppys Anukula Residency", "AR Residency", "Quality Inn", "Grand Estancia"));
        cityHotelsMap.put("Madurai", Arrays.asList("Heritage Madurai", "Courtyard by Marriott", "The Gateway Hotel Pasumalai", "Fortune Pandiyan", "JC Residency", "Hotel Sangam", "Madurai Residency", "Poppys Hotel", "Astoria Hotels", "Hotel Supreme"));
        cityHotelsMap.put("Salem", Arrays.asList("Radisson Salem", "Grand Estancia", "Hotel Sivaraj Inn", "CJ Pallazio", "Zibe Salem", "Hotel LRN Excellency", "Hotel Selvam", "Golden Palace", "Park Plaza", "Hotel Windsor Castle"));
        cityHotelsMap.put("Tirupati", Arrays.asList("Marasa Sarovar Premiere", "Taj Tirupati", "Fortune Select Grand Ridge", "Fortune Select Ridge", "Ramee Guestline", "FabHotel Tirupati", "Hotel Bliss", "Minerva Grand", "Aditya Homestay", "Golden Tulip"));
        cityHotelsMap.put("Vizag", Arrays.asList("The Gateway Hotel", "Novotel Varun Beach", "The Park Vizag", "Welcomhotel Devee Grand Bay", "Radisson Blu Resort", "Dolphin Hotel", "Fairfield by Marriott", "Four Points by Sheraton", "Keys Select", "Hotel Green Park"));
        cityHotelsMap.put("Mysore", Arrays.asList("Grand Mercure", "Radisson Blu Plaza", "Royal Orchid Metropole", "Fortune JP Palace", "Windflower Resort & Spa", "The Southern Star", "Hotel Mysore Palace", "Silent Shores Resort", "Lalitha Mahal Palace", "Hotel Golden Landmark"));
        cityHotelsMap.put("Manali", Arrays.asList("Span Resort & Spa", "The Solang Valley Resort", "Manu Allaya Resort", "Whispering Inn", "Apple Country Resorts", "Solang Ski Resort", "The Himalayan", "Manuallaya", "Shivadya Resort", "Larisa Resort"));
        cityHotelsMap.put("Ooty", Arrays.asList("Savoy IHCL SeleQtions", "Welcomheritage Savoy", "Glyngarth Resorts", "Sherlock Hotel", "Sinclairs Retreat", "Destiny The Farmstay", "Accord Highland", "Kurumba Village Resort", "Sterling Ooty Elk Hill", "Fern Hill"));
        cityHotelsMap.put("Kodaikanal", Arrays.asList("The Tamara Kodaikanal", "Carlton Hotel", "Sterling Kodaikanal Valley", "Kodai Resort", "Le Poshe by Sparsa", "Villa Retreat", "Lillys Valley Resort", "Hill Country Resort", "Kodai By The Lake", "Elephant Valley"));

        Map<String, Double> cityMultipliers = new HashMap<>();
        cityMultipliers.put("Goa", 1.6); cityMultipliers.put("Udaipur", 1.8); cityMultipliers.put("Jaipur", 1.5);
        cityMultipliers.put("Ooty", 1.4); cityMultipliers.put("Kodaikanal", 1.4); cityMultipliers.put("Mumbai", 1.3);
        cityMultipliers.put("Delhi", 1.2); cityMultipliers.put("Bangalore", 1.2); cityMultipliers.put("Kochi", 1.3);
        cityMultipliers.put("Mysore", 1.1); cityMultipliers.put("Pondicherry", 1.2);

        String[] hotelAmenitiesList = {
                "Valet Parking", "Infinity Pool", "Spa Wellness Center", "Fitness Gym",
                "Multi-cuisine Restaurant", "Airport Shuttle Service", "24h Room Service", "Free Wi-Fi"
        };

        String[] tags = {"Best Seller", "Luxury Stay", "Free Cancellation", "Special Deal", "Member Choice", "Top Rated"};

        List<Hotel> savedHotels = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : cityHotelsMap.entrySet()) {
            String city = entry.getKey();
            List<String> hotelNames = entry.getValue();
            double multiplier = cityMultipliers.getOrDefault(city, 1.0);

            for (int idx = 0; idx < hotelNames.size(); idx++) {
                String name = hotelNames.get(idx);
                String hotelId = "h_" + city.toLowerCase() + "_" + idx;

                List<String> hotelImages = generateHotelGallery(hotelId, idx);
                List<String> hotelAmenities = Arrays.asList(hotelAmenitiesList);

                Hotel hotel = Hotel.builder()
                        .id(hotelId)
                        .name(name)
                        .city(city)
                        .country("India")
                        .address((100 + idx * 8) + " Heritage Circle, Near City Center, " + city + ", India")
                        .stars(idx % 3 == 0 ? 5 : 4)
                        .rating(Double.valueOf((4.3 + (idx % 7) * 0.1)))
                        .reviewCount(80 + idx * 42)
                        .description("Welcome to " + name + ", an oasis of luxury and comfort in the heart of " + city + ". Boasting premium rooms, infinity pools, royal spas, and curated fine dining options, our property provides a gateway to exploring the scenic sights and local heritage trails of the city.")
                        .featured(idx == 0 || idx == 1)
                        .tag(tags[idx % tags.length])
                        .owner(owner)
                        .images(hotelImages)
                        .amenities(hotelAmenities)
                        .build();

                List<Room> rooms = generateRooms(hotel, multiplier);
                hotel.setRooms(rooms);
                hotel.setBasePrice(rooms.get(0).getPricePerNight());

                List<Review> reviews = generateReviews(hotel);
                hotel.setReviews(reviews);

                hotelRepository.save(hotel);
                savedHotels.add(hotel);
            }
        }

        if (customer != null && !savedHotels.isEmpty()) {
            seedInitialBookings(savedHotels, customer);
        }
    }

    private List<String> generateHotelGallery(String hotelId, int idx) {
        List<String> gallery = new ArrayList<>();
        gallery.add("/images/hotels/hotel-" + (idx % 12) + ".jpg");
        gallery.add("/images/hotels/hotel-" + ((idx + 2) % 12) + ".jpg");
        gallery.add("/images/hotels/hotel-" + ((idx + 4) % 12) + ".jpg");
        gallery.add("/images/hotels/hotel-" + ((idx + 6) % 12) + ".jpg");
        return gallery;
    }

    private List<Review> generateReviews(Hotel hotel) {
        Review rev1 = Review.builder()
                .id(hotel.getId() + "-rev1")
                .hotel(hotel)
                .guestName("Anjali Sharma")
                .rating(5.0)
                .date(LocalDate.of(2026, 5, 10))
                .comment("An absolutely breathtaking stay! The service was impeccably polished, matching the highest standards of luxury travel. The signature restaurant served authentic flavors that left a lasting impression.")
                .positivePoints("Exceptional hospitality, panoramic rooms, superb dining options.")
                .negativePoints("Advance bookings are essential since rooms occupy quickly.")
                .build();

        Review rev2 = Review.builder()
                .id(hotel.getId() + "-rev2")
                .hotel(hotel)
                .guestName("Vikram Malhotra")
                .rating(4.6)
                .date(LocalDate.of(2026, 6, 2))
                .comment("Wonderful property. Checked in for our family summer anniversary. The landscape design, swimming pool hygiene, and dedicated staff concierge are worth writing home about.")
                .positivePoints("Swimming pools, landscaping, concierge support.")
                .negativePoints("Slight traffic delays during checkout hours.")
                .build();

        return Arrays.asList(rev1, rev2);
    }

    private List<Room> generateRooms(Hotel hotel, double multiplier) {
        List<Room> rooms = new ArrayList<>();

        Object[][] categories = {
                {"Deluxe Room", "deluxe", 4500, 2, 1, 380, "deluxe", new String[]{"101", "102", "103", "104", "105"}},
                {"Superior Room", "standard", 6000, 3, 2, 450, "superior", new String[]{"151", "152", "153", "154", "155"}},
                {"Premium City View", "standard", 8000, 2, 1, 480, "cityView", new String[]{"201", "202", "203", "204"}},
                {"Premium Lake View", "deluxe", 10000, 2, 1, 520, "lakeView", new String[]{"301", "302", "303", "304"}},
                {"Executive Suite", "suite", 15000, 3, 2, 780, "executiveSuite", new String[]{"401", "402", "403"}},
                {"Royal Suite", "suite", 25000, 4, 2, 1100, "royalSuite", new String[]{"501", "502"}},
                {"Presidential Suite", "suite", 45000, 4, 2, 1800, "presidentialSuite", new String[]{"601"}},
                {"Luxury Villa", "family", 60000, 4, 2, 2200, "luxuryVilla", new String[]{"V01", "V02"}},
                {"Private Pool Villa", "family", 80000, 6, 3, 2800, "poolVilla", new String[]{"P01", "P02"}},
                {"Heritage Palace Suite", "suite", 120000, 4, 2, 3200, "heritageSuite", new String[]{"H01", "H02"}}
        };

        for (int idx = 0; idx < categories.length; idx++) {
            Object[] cat = categories[idx];
            String roomName = (String) cat[0];
            String type = (String) cat[1];
            int basePrice = (Integer) cat[2];
            int guests = (Integer) cat[3];
            int beds = (Integer) cat[4];
            int size = (Integer) cat[5];
            String imageKey = (String) cat[6];
            String[] roomNos = (String[]) cat[7];

            double price = Math.round(basePrice * multiplier);

            Room room = Room.builder()
                    .id(hotel.getId() + "-r" + (idx + 1))
                    .hotelId(hotel.getId())
                    .roomType(roomName)
                    .roomNumber(roomNos[0])
                    .description("Premium room featuring standard luxury comforts.")
                    .maxGuests(guests)
                    .bedType(beds + " King Bed")
                    .roomSize(size)
                    .pricePerNight(price)
                    .availableCount(roomNos.length)
                    .status("AVAILABLE")
                    .images(Collections.singletonList("/images/rooms/" + imageKey + ".jpg"))
                    .amenities(Arrays.asList("Individually Controlled AC", "Smart TV with Streaming", "Plush Robes & Linens", "Fully Stocked Minibar", "Espresso Machine", "High-speed Wi-Fi"))
                    .build();

            roomRepository.save(room);
            rooms.add(room);

            // Seed physical room numbers
            for (String num : roomNos) {
                RoomNumber rn = RoomNumber.builder()
                        .id(com.staysphere.backend.config.IdGenerator.nextId())
                        .room(room)
                        .number(num)
                        .status("Available")
                        .build();
                roomNumberRepository.save(rn);
            }
        }

        return rooms;
    }

    private void seedRoomsIfEmpty() {
        List<Hotel> approvedHotels = hotelRepository.findAll().stream()
                .filter(h -> h.getTag() == null || !"Pending Approval".equalsIgnoreCase(h.getTag()))
                .collect(Collectors.toList());
        for (Hotel hotel : approvedHotels) {
            if (roomRepository.findByHotelId(hotel.getId()).isEmpty()) {
                seed5RoomCategories(hotel.getId(), hotel.getBasePrice());
            }
        }
    }

    private void seed5RoomCategories(String hotelId, Double basePrice) {
        double base = basePrice != null ? basePrice : 3500.0;
        Object[][] categories = {
            {"Standard", "Cozy standard room with all basic amenities.", 2, "Queen Bed", 280, base, 5, "/images/rooms/standard.jpg"},
            {"Deluxe", "Spacious deluxe room with premium fittings and a working space.", 2, "King Bed", 380, base * 1.3, 4, "/images/rooms/deluxe.jpg"},
            {"Premium", "Elegant premium room boasting stunning views and luxury bath amenities.", 3, "King Bed", 480, base * 1.7, 3, "/images/rooms/cityView.jpg"},
            {"Executive Suite", "Ultra-luxurious executive suite with a separate living lounge.", 4, "King Bed + Sofa Bed", 780, base * 2.5, 2, "/images/rooms/executiveSuite.jpg"},
            {"Presidential Suite", "The pinnacle of grand luxury with a private terrace and personal butler.", 6, "2 King Beds", 1800, base * 5.0, 1, "/images/rooms/presidentialSuite.jpg"}
        };

        List<Room> createdRooms = new ArrayList<>();
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
                        .images(Collections.singletonList(img))
                        .amenities(Arrays.asList("Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Mini Fridge", "Espresso Machine"))
                        .build();
                roomRepository.save(room);
                createdRooms.add(room);

                // Seed physical room numbers
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

    private void seedInitialBookings(List<Hotel> hotels, User customer) {
        Hotel mumbaiHotel = hotels.stream().filter(h -> "h_mumbai_0".equals(h.getId())).findFirst().orElse(null);
        Hotel udaipurHotel = hotels.stream().filter(h -> "h_udaipur_0".equals(h.getId())).findFirst().orElse(null);
        Hotel ootyHotel = hotels.stream().filter(h -> "h_ooty_0".equals(h.getId())).findFirst().orElse(null);

        if (mumbaiHotel != null) {
            Room room = mumbaiHotel.getRooms().stream().filter(r -> (mumbaiHotel.getId() + "-r4").equals(r.getId())).findFirst().orElse(mumbaiHotel.getRooms().get(0));
            Booking b1 = Booking.builder()
                    .id("STS-2026-00125")
                    .hotel(mumbaiHotel)
                    .hotelName(mumbaiHotel.getName())
                    .hotelImage(mumbaiHotel.getImages().get(1))
                    .room(room)
                    .roomName(room.getRoomType())
                    .checkIn(LocalDate.of(2026, 6, 15))
                    .checkOut(LocalDate.of(2026, 6, 20))
                    .guests(2)
                    .roomsCount(1)
                    .totalPrice(96000.0)
                    .guestFullName("Rohan Mehta")
                    .guestEmail("rohan@example.com")
                    .guestPhone("+91 99999-00125")
                    .specialRequests("High floor, sea view preferred.")
                    .paymentMethod("Credit Card (Visa ending in 4242)")
                    .status("Confirmed")
                    .createdAt(LocalDateTime.of(2026, 6, 5, 10, 14, 0))
                    .assignedRoomNumber("302")
                    .qrCodeToken("STS-QR-MUMBAI-00125")
                    .user(customer)
                    .build();
            bookingRepository.save(b1);
        }

        if (udaipurHotel != null) {
            Room room = udaipurHotel.getRooms().stream().filter(r -> (udaipurHotel.getId() + "-r6").equals(r.getId())).findFirst().orElse(udaipurHotel.getRooms().get(0));
            Booking b2 = Booking.builder()
                    .id("STS-2026-00438")
                    .hotel(udaipurHotel)
                    .hotelName(udaipurHotel.getName())
                    .hotelImage(udaipurHotel.getImages().get(0))
                    .room(room)
                    .roomName(room.getRoomType())
                    .checkIn(LocalDate.of(2026, 6, 9))
                    .checkOut(LocalDate.of(2026, 6, 12))
                    .guests(2)
                    .roomsCount(1)
                    .totalPrice(198000.0)
                    .guestFullName("Sarah Jenkins")
                    .guestEmail("sarah@example.com")
                    .guestPhone("+91 98765-43210")
                    .paymentMethod("UPI (PhonePe)")
                    .status("Checked-In")
                    .createdAt(LocalDateTime.of(2026, 6, 1, 8, 12, 0))
                    .assignedRoomNumber("501")
                    .qrCodeToken("STS-QR-UDAIPUR-00438")
                    .user(customer)
                    .build();
            bookingRepository.save(b2);
        }

        if (ootyHotel != null) {
            Room room = ootyHotel.getRooms().stream().filter(r -> (ootyHotel.getId() + "-r1").equals(r.getId())).findFirst().orElse(ootyHotel.getRooms().get(0));
            Booking b3 = Booking.builder()
                    .id("STS-2026-00982")
                    .hotel(ootyHotel)
                    .hotelName(ootyHotel.getName())
                    .hotelImage(ootyHotel.getImages().get(0))
                    .room(room)
                    .roomName(room.getRoomType())
                    .checkIn(LocalDate.of(2026, 5, 10))
                    .checkOut(LocalDate.of(2026, 5, 13))
                    .guests(3)
                    .roomsCount(1)
                    .totalPrice(38000.0)
                    .guestFullName("Alice Johnson")
                    .guestEmail("alice@example.com")
                    .guestPhone("+91 99999-01999")
                    .paymentMethod("UPI (Paytm)")
                    .status("Checked-Out")
                    .createdAt(LocalDateTime.of(2026, 5, 1, 15, 20, 0))
                    .assignedRoomNumber("104")
                    .qrCodeToken("STS-QR-OOTY-00982")
                    .user(customer)
                    .build();
            bookingRepository.save(b3);
        }

        Notification n1 = Notification.builder()
                .id(IdGenerator.nextId())
                .title("Welcome to StaySphere")
                .message("Discover handpicked luxury escapes and elite members benefits.")
                .type("Welcome")
                .isRead(false)
                .user(customer)
                .build();

        Notification n2 = Notification.builder()
                .id(IdGenerator.nextId())
                .title("Elite Membership Active")
                .message("Save up to 15% on booking suites and palaces with member choice rates.")
                .type("Elite Status")
                .isRead(false)
                .user(customer)
                .build();

        notificationRepository.saveAll(Arrays.asList(n1, n2));
    }

    private void seedAiAssistantData() {
        if (aiDocumentRepository.count() > 0) {
            return;
        }

        // 1. Seed AI Documents / FAQs
        aiDocumentRepository.saveAll(Arrays.asList(
                AiDocument.builder()
                        .title("FAQ: How to Book a Luxury Retreat")
                        .content("To book a stay on StaySphere, browse hotels on the home page, select your check-in and check-out dates, choose your preferred room (e.g. Royal Suite or Private Pool Villa), fill in guest details, and complete payment via UPI, Card, or Netbanking.")
                        .type("FAQ")
                        .build(),
                AiDocument.builder()
                        .title("FAQ: Cancellation Policies")
                        .content("StaySphere offers a flexible cancellation extension for Silver and Gold Elite members. You can request a cancellation from your Booking dashboard. Free cancellations are allowed up to 24 hours prior to check-in.")
                        .type("FAQ")
                        .build(),
                AiDocument.builder()
                        .title("FAQ: Room Upgrade Policies")
                        .content("Room upgrades are offered complimentary to Gold and Platinum members upon arrival subject to room availability.")
                        .type("FAQ")
                        .build()
        ));

        // 2. Seed Policies
        policyRepository.saveAll(Arrays.asList(
                Policy.builder()
                        .name("Standard Cancellation")
                        .rules("Cancellations made 24 hours or more before check-in qualify for a 100% refund. Late cancellations made within 24 hours of check-in are penalized with a 50% charge. No-shows incur a 100% charge.")
                        .build(),
                Policy.builder()
                        .name("Check-in and Check-out")
                        .rules("Standard check-in is at 2:00 PM and check-out is at 12:00 PM. Early check-in or late check-out requests are subject to availability and can be coordinated via the concierge desk.")
                        .build()
        ));

        // 3. Seed Travel Guides
        travelGuideRepository.saveAll(Arrays.asList(
                TravelGuide.builder()
                        .destination("Mumbai")
                        .description("Mumbai, the capital of Maharashtra, is a bustling coastal city and India's financial hub, rich in colonial history and local street life.")
                        .recommendations("Take a sunset walk at Marine Drive, visit the iconic Gateway of India, explore the ancient Elephanta Caves, and dine at fine restaurants in Colaba.")
                        .build(),
                TravelGuide.builder()
                        .destination("Udaipur")
                        .description("Udaipur, the romantic City of Lakes, is famed for its royal palaces, heritage architecture, and scenic boat cruises.")
                        .recommendations("Visit the grand City Palace, take a boat cruise on Lake Pichola, visit the scenic Jag Mandir Island, and watch local cultural dance at Bagore Ki Haveli.")
                        .build(),
                TravelGuide.builder()
                        .destination("Goa")
                        .description("Goa is India's premier beach destination, blending Portuguese culture, sandy shores, vibrant shacks, and rich coastal spices.")
                        .recommendations("Relax on Baga and Palolem beaches, explore the historic churches of Old Goa, take a spice plantation tour, and enjoy dynamic night markets.")
                        .build()
        ));
    }

    private void seedRoomNumbersIfEmpty() {
        if (roomNumberRepository.count() == 0) {
            List<Room> allRooms = roomRepository.findAll();
            for (Room room : allRooms) {
                int count = room.getAvailableCount() != null ? room.getAvailableCount() : 5;
                int start = 101;
                String rt = room.getRoomType() != null ? room.getRoomType().toLowerCase() : "";
                if (rt.contains("deluxe")) start = 201;
                else if (rt.contains("premium")) start = 301;
                else if (rt.contains("suite")) start = 401;
                else if (rt.contains("villa")) start = 501;

                for (int j = 0; j < count; j++) {
                    RoomNumber rn = RoomNumber.builder()
                            .id(IdGenerator.nextId())
                            .room(room)
                            .number(String.valueOf(start + j))
                            .status("Available")
                            .build();
                    roomNumberRepository.save(rn);
                }
            }
        }
    }
}
