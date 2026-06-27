package com.staysphere.backend.service;

import com.staysphere.backend.dto.BookingDto;
import com.staysphere.backend.exception.BadRequestException;
import com.staysphere.backend.exception.ResourceNotFoundException;
import com.staysphere.backend.mapper.DtoMapper;
import com.staysphere.backend.model.*;
import com.staysphere.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomNumberRepository roomNumberRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private SocketService socketService;

    @Override
    @Transactional
    public BookingDto createBooking(BookingDto bookingDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Hotel hotel = hotelRepository.findById(bookingDto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + bookingDto.getHotelId()));

        Room room = roomRepository.findById(bookingDto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + bookingDto.getRoomId()));

        // Validate booking dates
        if (bookingDto.getCheckIn().isAfter(bookingDto.getCheckOut()) || bookingDto.getCheckIn().isEqual(bookingDto.getCheckOut())) {
            throw new BadRequestException("Check-in date must be before check-out date");
        }

        // Validate room availability and dates
        if (room.getAvailableCount() == null || room.getAvailableCount() < bookingDto.getRooms()) {
            throw new BadRequestException("No rooms are available for the selected dates. Please choose another date or room.");
        }

        // Allocate a room number
        String assignedRoomNumber = room.getRoomNumber() != null ? room.getRoomNumber() : "101";

        // Calculate nights and price
        long nights = ChronoUnit.DAYS.between(bookingDto.getCheckIn(), bookingDto.getCheckOut());
        double subtotal = room.getPricePerNight() * bookingDto.getRooms() * nights;
        
        // Calculate stay discount (10% if nights >= 3)
        double stayDiscount = nights >= 3 ? Math.round(subtotal * 0.10) : 0.0;
        
        // Calculate coupon discount
        double couponDiscount = 0.0;
        if (bookingDto.getCouponCode() != null && !bookingDto.getCouponCode().trim().isEmpty()) {
            String coupon = bookingDto.getCouponCode().trim().toUpperCase();
            if ("WELCOME10".equals(coupon)) {
                couponDiscount = Math.round((subtotal - stayDiscount) * 0.10);
            } else if ("STAYGOLD".equals(coupon)) {
                couponDiscount = Math.round((subtotal - stayDiscount) * 0.15);
            }
        }
        
        double totalDiscount = stayDiscount + couponDiscount;
        double taxableAmount = subtotal - totalDiscount;
        double cgst = Math.round(taxableAmount * 0.06);
        double sgst = Math.round(taxableAmount * 0.06);
        double total = taxableAmount + cgst + sgst + 299.0;

        int year = java.time.LocalDate.now().getYear();
        String bookingIdNum = String.format("%05d", (int) (1 + Math.random() * 99999));
        String bookingId = "STS-" + year + "-" + bookingIdNum;
        String qrToken = "STS-QR-" + hotel.getName().replaceAll("\\s+", "-").toUpperCase() + "-" + bookingIdNum;

        // Build Booking
        Booking booking = Booking.builder()
                .id(bookingId)
                .hotel(hotel)
                .hotelName(hotel.getName())
                .hotelImage(hotel.getImages().isEmpty() ? "" : hotel.getImages().get(0))
                .room(room)
                .roomName(room.getRoomType())
                .checkIn(bookingDto.getCheckIn())
                .checkOut(bookingDto.getCheckOut())
                .guests(bookingDto.getGuests())
                .roomsCount(bookingDto.getRooms())
                .totalPrice(total)
                .guestFullName(bookingDto.getGuestDetails().getFullName())
                .guestEmail(bookingDto.getGuestDetails().getEmail())
                .guestPhone(bookingDto.getGuestDetails().getPhone())
                .specialRequests(bookingDto.getGuestDetails().getSpecialRequests())
                .paymentMethod(bookingDto.getPaymentMethod())
                .status("Confirmed") // Immediately confirmed on payment
                .assignedRoomNumber(assignedRoomNumber)
                .couponCode(bookingDto.getCouponCode())
                .discountAmount(totalDiscount)
                .cgst(cgst)
                .sgst(sgst)
                .gstCompany(bookingDto.getGstCompany())
                .gstin(bookingDto.getGstin())
                .qrCodeToken(qrToken)
                .user(user)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Decrement availability in transaction
        room.setAvailableCount(room.getAvailableCount() - bookingDto.getRooms());
        if (room.getAvailableCount() <= 0) {
            room.setStatus("OCCUPIED");
        }
        roomRepository.save(room);

        // Broadcast availability update
        socketService.broadcastRoomAvailability(room.getId(), room.getAvailableCount());

        // Save Payment
        Payment payment = Payment.builder()
                .id("PAY-" + bookingId + "-" + (int)(1000 + Math.random() * 9000))
                .booking(savedBooking)
                .amount(total)
                .method(bookingDto.getPaymentMethod() != null ? bookingDto.getPaymentMethod() : "Credit Card")
                .status("SUCCESS")
                .transactionId("TXN-" + (int)(100000 + Math.random() * 900000))
                .build();
        paymentRepository.save(payment);

        // Generate Invoice immediately on payment success
        String invoiceNum = "INV-" + year + "-" + bookingIdNum;
        Invoice invoice = Invoice.builder()
                .id(invoiceNum)
                .invoiceNumber(invoiceNum)
                .booking(savedBooking)
                .subtotal(subtotal)
                .discount(totalDiscount)
                .cgst(cgst)
                .sgst(sgst)
                .total(total)
                .build();
        invoiceRepository.save(invoice);

        // Add Notification
        notificationService.addNotification(
                user,
                "Booking Confirmed",
                "Your booking request for " + hotel.getName() + " (" + room.getRoomType() + ") has been approved and confirmed. Invoice " + invoiceNum + " generated.",
                "Just now"
        );

        // Log audit log
        activityLogService.logActivity(user, "Booking Created", "Booking created and confirmed for hotel " + hotel.getName() + " (Room: " + assignedRoomNumber + ")", null, "Booking", bookingId);
        activityLogService.logActivity(user, "Payment Successful", "Payment of ₹" + total + " successful via " + payment.getMethod(), null, "Payment", payment.getId());
        activityLogService.logActivity(user, "Invoice Generated", "Invoice " + invoiceNum + " generated successfully", null, "Invoice", invoiceNum);

        return DtoMapper.toBookingDto(savedBooking);
    }

    private String allocateRoomNumber(String roomId, java.time.LocalDate checkIn, java.time.LocalDate checkOut) {
        List<RoomNumber> roomNumbers = roomNumberRepository.findByRoomId(roomId);
        if (roomNumbers.isEmpty()) {
            throw new BadRequestException("No physical room numbers defined for this room category");
        }

        List<RoomNumber> availableRoomNumbers = roomNumbers.stream()
                .filter(rn -> {
                    if ("Maintenance".equalsIgnoreCase(rn.getStatus()) || "Blocked".equalsIgnoreCase(rn.getStatus())) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (availableRoomNumbers.isEmpty()) {
            return roomNumbers.get(0).getNumber();
        }

        return availableRoomNumbers.get(0).getNumber();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(DtoMapper::toBookingDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDto> getPartnerBookings(Long ownerId) {
        return bookingRepository.findByHotelOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(DtoMapper::toBookingDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DtoMapper::toBookingDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingDto cancelBooking(String bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        User user = booking.getUser();
        
        java.time.LocalDate today = java.time.LocalDate.now();
        double refundAmount = 0.0;
        String refundStatus = "REFUNDED";
        String description = "";

        if (today.isBefore(booking.getCheckIn())) {
            long daysToCheckIn = ChronoUnit.DAYS.between(today, booking.getCheckIn());
            if (daysToCheckIn >= 1) {
                refundAmount = booking.getTotalPrice();
                description = "Free cancellation (Full refund)";
            } else {
                refundAmount = booking.getTotalPrice() * 0.5;
                description = "Late cancellation (50% deduction penalty)";
            }
        } else {
            refundAmount = 0.0;
            refundStatus = "FAILED";
            description = "No-Show (100% charge applied)";
        }

        booking.setStatus("Cancelled");
        
        // Release room and increment availability
        if (booking.getRoom() != null) {
            Room room = booking.getRoom();
            room.setAvailableCount((room.getAvailableCount() != null ? room.getAvailableCount() : 0) + booking.getRoomsCount());
            room.setStatus("AVAILABLE");
            roomRepository.save(room);
            socketService.broadcastRoomAvailability(room.getId(), room.getAvailableCount());
        }

        Booking saved = bookingRepository.save(booking);

        Payment refundPayment = Payment.builder()
                .id("PAY-REF-" + bookingId + "-" + (int)(1000 + Math.random() * 9000))
                .booking(booking)
                .amount(refundAmount)
                .method(booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "CARD")
                .status(refundStatus)
                .transactionId("TXN-REF-" + (int)(100000 + Math.random() * 900000))
                .build();
        paymentRepository.save(refundPayment);

        notificationService.addNotification(
                booking.getUser(),
                "Booking Cancelled",
                "Your reservation " + bookingId + " at " + booking.getHotelName() + " has been cancelled. Policy: " + description,
                "Just now"
        );

        activityLogService.logActivity(user, "Booking Cancelled", "Reservation " + bookingId + " cancelled. " + description, null, "Booking", bookingId);

        return DtoMapper.toBookingDto(saved);
    }

    @Override
    @Transactional
    public BookingDto updateBookingStatus(String bookingId, String status, String roomNumber) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        booking.setStatus(status);

        if ("Confirmed".equalsIgnoreCase(status) || "Room Assigned".equalsIgnoreCase(status)) {
            String finalRoomNum = roomNumber;
            if (finalRoomNum == null || finalRoomNum.trim().isEmpty()) {
                finalRoomNum = allocateRoomNumber(booking);
            }
            booking.setAssignedRoomNumber(finalRoomNum);
            booking.setStatus("Room Assigned");

            if (booking.getRoom() != null) {
                java.util.Optional<RoomNumber> rnOpt = roomNumberRepository.findByRoomIdAndNumber(booking.getRoom().getId(), finalRoomNum);
                if (rnOpt.isPresent()) {
                    RoomNumber rn = rnOpt.get();
                    rn.setStatus("Reserved");
                    roomNumberRepository.save(rn);
                }
            }

            Payment payment = Payment.builder()
                    .id("PAY-" + bookingId + "-" + (int)(1000 + Math.random() * 9000))
                    .booking(booking)
                    .amount(booking.getTotalPrice())
                    .method(booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "CARD")
                    .status("SUCCESS")
                    .transactionId("TXN-" + (int)(100000 + Math.random() * 900000))
                    .build();
            paymentRepository.save(payment);

            activityLogService.logActivity(booking.getUser(), "Booking Approved", "Booking approved for hotel " + booking.getHotelName() + " (Room " + finalRoomNum + ")", null, "Booking", bookingId);
            activityLogService.logActivity(booking.getUser(), "Room Assigned", "Room " + finalRoomNum + " assigned to booking " + bookingId, null, "Booking", bookingId);

            notificationService.addNotification(booking.getUser(), "Booking Approved", "Your booking request at " + booking.getHotelName() + " has been approved.", "Booking Approved");
            notificationService.addNotification(booking.getUser(), "Room Assigned", "Room " + finalRoomNum + " has been assigned to your booking " + bookingId + ".", "Room Assigned");

        } else if ("Checked-In".equalsIgnoreCase(status)) {
            if (booking.getAssignedRoomNumber() != null && booking.getRoom() != null) {
                java.util.Optional<RoomNumber> rnOpt = roomNumberRepository.findByRoomIdAndNumber(booking.getRoom().getId(), booking.getAssignedRoomNumber());
                if (rnOpt.isPresent()) {
                    RoomNumber rn = rnOpt.get();
                    rn.setStatus("Occupied");
                    roomNumberRepository.save(rn);
                }
            }

            activityLogService.logActivity(booking.getUser(), "Check-In", "Checked in to room " + booking.getAssignedRoomNumber(), null, "Booking", bookingId);
            notificationService.addNotification(booking.getUser(), "Check-In Reminder", "You have successfully checked in to Room " + booking.getAssignedRoomNumber() + ".", "Check-In Reminder");

        } else if ("Checked-Out".equalsIgnoreCase(status)) {
            if (booking.getAssignedRoomNumber() != null && booking.getRoom() != null) {
                java.util.Optional<RoomNumber> rnOpt = roomNumberRepository.findByRoomIdAndNumber(booking.getRoom().getId(), booking.getAssignedRoomNumber());
                if (rnOpt.isPresent()) {
                    RoomNumber rn = rnOpt.get();
                    rn.setStatus("Cleaning");
                    roomNumberRepository.save(rn);
                }
            }

            double discount = booking.getDiscountAmount() != null ? booking.getDiscountAmount() : 0.0;
            double cgst = booking.getCgst() != null ? booking.getCgst() : 0.0;
            double sgst = booking.getSgst() != null ? booking.getSgst() : 0.0;
            double total = booking.getTotalPrice();
            double subtotal = total - cgst - sgst + discount;

            int currentYear = java.time.LocalDate.now().getYear();
            String invoiceSuffix = bookingId.substring(bookingId.lastIndexOf("-") + 1);
            String invoiceNum = "INV-" + currentYear + "-" + invoiceSuffix;

            if (!invoiceRepository.existsById(invoiceNum)) {
                Invoice invoice = Invoice.builder()
                        .id(invoiceNum)
                        .invoiceNumber(invoiceNum)
                        .booking(booking)
                        .subtotal(subtotal)
                        .discount(discount)
                        .cgst(cgst)
                        .sgst(sgst)
                        .total(total)
                        .build();
                invoiceRepository.save(invoice);
            }
            activityLogService.logActivity(booking.getUser(), "Check-Out", "Checked out of room " + booking.getAssignedRoomNumber(), null, "Booking", bookingId);
            activityLogService.logActivity(booking.getUser(), "Invoice Generated", "Invoice generated for check-out of booking " + bookingId, null, "Booking", bookingId);
            notificationService.addNotification(booking.getUser(), "Invoice Generated", "Your invoice " + invoiceNum + " has been generated for your stay at " + booking.getHotelName() + ".", "Invoice Generated");
        }

        Booking saved = bookingRepository.save(booking);

        notificationService.addNotification(
                booking.getUser(),
                "Booking Status Updated",
                "Your booking " + bookingId + " at " + booking.getHotelName() + " status is now: " + saved.getStatus() + ".",
                "Booking Status Updated"
        );

        return DtoMapper.toBookingDto(saved);
    }

    @Override
    @Transactional
    public BookingDto updateBooking(String bookingId, BookingDto bookingDto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        String oldStatus = booking.getStatus();
        String newStatus = bookingDto.getStatus();

        booking.setCheckIn(bookingDto.getCheckIn());
        booking.setCheckOut(bookingDto.getCheckOut());
        booking.setGuests(bookingDto.getGuests());
        booking.setRoomsCount(bookingDto.getRooms());
        booking.setGuestFullName(bookingDto.getGuestDetails().getFullName());
        booking.setGuestEmail(bookingDto.getGuestDetails().getEmail());
        booking.setGuestPhone(bookingDto.getGuestDetails().getPhone());
        booking.setSpecialRequests(bookingDto.getGuestDetails().getSpecialRequests());
        
        if (bookingDto.getAssignedRoomNumber() != null) {
            booking.setAssignedRoomNumber(bookingDto.getAssignedRoomNumber());
        }

        if (newStatus != null && !newStatus.equalsIgnoreCase(oldStatus)) {
            bookingRepository.save(booking); // Save the dates/details first
            return updateBookingStatus(bookingId, newStatus, booking.getAssignedRoomNumber());
        }

        Booking saved = bookingRepository.save(booking);
        return DtoMapper.toBookingDto(saved);
    }

    private String allocateRoomNumber(Booking booking) {
        Room room = booking.getRoom();
        if (room == null) {
            throw new BadRequestException("No room category linked to booking");
        }

        List<RoomNumber> roomNumbers = roomNumberRepository.findByRoomId(room.getId());
        if (roomNumbers.isEmpty()) {
            throw new BadRequestException("No physical room numbers defined for room category " + room.getRoomType());
        }

        List<RoomNumber> availableRoomNumbers = roomNumbers.stream()
                .filter(rn -> {
                    if ("Maintenance".equalsIgnoreCase(rn.getStatus()) || "Blocked".equalsIgnoreCase(rn.getStatus())) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (availableRoomNumbers.isEmpty()) {
            return roomNumbers.get(0).getNumber();
        }

        availableRoomNumbers.sort((rn1, rn2) -> {
            int f1 = getFloor(rn1.getNumber());
            int f2 = getFloor(rn2.getNumber());
            if (f1 != f2) {
                return Integer.compare(f1, f2);
            }
            
            long c1 = countBookingsOnFloor(room.getHotelId(), f1, booking.getCheckIn(), booking.getCheckOut());
            long c2 = countBookingsOnFloor(room.getHotelId(), f2, booking.getCheckIn(), booking.getCheckOut());
            if (c1 != c2) {
                return Long.compare(c2, c1);
            }

            return rn1.getNumber().compareTo(rn2.getNumber());
        });

        return availableRoomNumbers.get(0).getNumber();
    }

    private int getFloor(String number) {
        if (number == null || number.isEmpty()) return 1;
        StringBuilder sb = new StringBuilder();
        for (char c : number.toCharArray()) {
            if (Character.isDigit(c)) {
                sb.append(c);
            } else {
                break;
            }
        }
        if (sb.length() == 0) return 1;
        int num = Integer.parseInt(sb.toString());
        if (num >= 100) {
            return num / 100;
        }
        return num;
    }

    private long countOverlappingBookingsForRoomNumber(String roomId, String roomNumber, java.time.LocalDate checkin, java.time.LocalDate checkout) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getRoom() != null && b.getRoom().getId().equals(roomId))
                .filter(b -> roomNumber.equalsIgnoreCase(b.getAssignedRoomNumber()))
                .filter(b -> !List.of("Cancelled", "CANCELLED", "Refunded", "REFUNDED").contains(b.getStatus()))
                .filter(b -> b.getCheckIn().isBefore(checkout) && b.getCheckOut().isAfter(checkin))
                .count();
    }

    private long countBookingsOnFloor(String hotelId, int floor, java.time.LocalDate checkin, java.time.LocalDate checkout) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getHotel() != null && b.getHotel().getId().equals(hotelId))
                .filter(b -> b.getAssignedRoomNumber() != null && getFloor(b.getAssignedRoomNumber()) == floor)
                .filter(b -> !List.of("Cancelled", "CANCELLED", "Refunded", "REFUNDED").contains(b.getStatus()))
                .filter(b -> b.getCheckIn().isBefore(checkout) && b.getCheckOut().isAfter(checkin))
                .count();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDto getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        return DtoMapper.toBookingDto(booking);
    }
}
