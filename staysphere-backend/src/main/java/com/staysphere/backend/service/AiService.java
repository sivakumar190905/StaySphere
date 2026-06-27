package com.staysphere.backend.service;

import com.staysphere.backend.model.AiDocument;
import com.staysphere.backend.model.ChatHistory;
import com.staysphere.backend.model.Policy;
import com.staysphere.backend.model.TravelGuide;
import com.staysphere.backend.model.Hotel;
import com.staysphere.backend.model.Room;
import com.staysphere.backend.model.Review;
import com.staysphere.backend.repository.AiDocumentRepository;
import com.staysphere.backend.repository.ChatHistoryRepository;
import com.staysphere.backend.repository.PolicyRepository;
import com.staysphere.backend.repository.TravelGuideRepository;
import com.staysphere.backend.repository.HotelRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AiService {

    private final ChatClient chatClient;

    @Autowired
    private AiDocumentRepository aiDocumentRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private TravelGuideRepository travelGuideRepository;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public AiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultSystem("You are the StaySphere Concierge, a helpful AI assistant for a luxury hotel booking platform. " +
                        "Your goal is to help users find hotels, provide information about their bookings, and offer travel recommendations. " +
                        "Be polite, concise, and luxurious in your tone.")
                .build();
    }

    public String generateResponse(String message, String userEmail) {
        try {
            // Retrieve dynamic context from MongoDB
            List<AiDocument> docs = aiDocumentRepository.findAll();
            List<Policy> pols = policyRepository.findAll();
            List<TravelGuide> guides = travelGuideRepository.findAll();
            List<Hotel> hotelsList = hotelRepository.findAll();
            
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("Here is the context about StaySphere:\n\n");
            
            contextBuilder.append("HOTELS DATA (Live MongoDB Database):\n");
            for (Hotel h : hotelsList) {
                if (h == null) continue;
                contextBuilder.append("Hotel Name: ").append(h.getName()).append("\n")
                              .append("Description: ").append(h.getDescription()).append("\n")
                              .append("Stars: ").append(h.getStars()).append("\n")
                              .append("Rating: ").append(h.getRating()).append("\n")
                              .append("City: ").append(h.getCity()).append("\n")
                              .append("Country: ").append(h.getCountry()).append("\n")
                              .append("Address: ").append(h.getAddress()).append("\n")
                              .append("Base Price: ₹").append(h.getBasePrice()).append("\n")
                              .append("Amenities: ").append(String.join(", ", h.getAmenities())).append("\n");
                
                List<Room> roomsList = h.getRooms();
                if (roomsList != null && !roomsList.isEmpty()) {
                    contextBuilder.append("Available Room Categories for this hotel:\n");
                    for (Room r : roomsList) {
                        if (r != null) {
                            contextBuilder.append("  - Room Name: ").append(r.getRoomType())
                                          .append(" | Type: ").append(r.getRoomType())
                                          .append(" | Price: ₹").append(r.getPricePerNight())
                                          .append(" | Capacity: ").append(r.getMaxGuests()).append(" Guests, ").append(Math.max(1, r.getMaxGuests() / 2)).append(" Beds")
                                          .append(" | Size: ").append(r.getRoomSize()).append(" sqft")
                                          .append(" | Amenities: ").append(String.join(", ", r.getAmenities()))
                                          .append(" | Status: ").append(r.getStatus()).append("\n");
                        }
                    }
                }
                
                List<Review> reviewsList = h.getReviews();
                if (reviewsList != null && !reviewsList.isEmpty()) {
                    contextBuilder.append("Guest Reviews:\n");
                    for (Review rev : reviewsList) {
                        if (rev != null) {
                            contextBuilder.append("  - Guest: ").append(rev.getGuestName())
                                          .append(" | Rating: ").append(rev.getRating())
                                          .append(" | Review: ").append(rev.getComment()).append("\n");
                        }
                    }
                }
                contextBuilder.append("\n");
            }
            
            contextBuilder.append("HOTEL DOCUMENTS & FAQs:\n");
            for (AiDocument doc : docs) {
                contextBuilder.append("- ").append(doc.getTitle()).append(": ").append(doc.getContent()).append("\n");
            }
            contextBuilder.append("POLICIES:\n");
            for (Policy pol : pols) {
                contextBuilder.append("- ").append(pol.getName()).append(": ").append(pol.getRules()).append("\n");
            }
            contextBuilder.append("TRAVEL GUIDES:\n");
            for (TravelGuide guide : guides) {
                contextBuilder.append("- Destination: ").append(guide.getDestination())
                        .append(". Description: ").append(guide.getDescription())
                        .append(". Recommendations: ").append(guide.getRecommendations()).append("\n");
            }
            
            String systemText = "You are the StaySphere Concierge, a helpful AI assistant for a luxury hotel booking platform. " +
                    "Use the Context below to answer questions about hotels, pricing, amenities, room availability, recommendations, policies, etc.\n\n" +
                    "CRITICAL INSTRUCTIONS:\n" +
                    "1. Always use actual MongoDB data from the Context below to answer hotel-related queries.\n" +
                    "2. If no hotel matches the location/amenities/criteria in the Context, or if the Context lacks information to answer the question, you must respond politely with exactly this phrase: \"No matching hotel information found.\"\n" +
                    "3. Do NOT make up any hotels, prices, or amenities.\n" +
                    "4. Never return blank responses.\n" +
                    "5. Keep the tone polite, concise, and luxurious.\n\n" +
                    "Context:\n" + contextBuilder.toString();

            String response = this.chatClient.prompt()
                    .system(systemText)
                    .user(message)
                    .call()
                    .content();
            
            // Save to ChatHistory
            chatHistoryRepository.save(ChatHistory.builder()
                    .userEmail(userEmail)
                    .message(message)
                    .response(response)
                    .build());
                    
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            try {
                chatHistoryRepository.save(ChatHistory.builder()
                        .userEmail(userEmail)
                        .message(message)
                        .response("Concierge desk high volume error.")
                        .build());
            } catch (Exception ex) {
                // Ignore DB save errors on fallback
            }
            return "I apologize, but our concierge desk is currently experiencing high volume. Please try asking your question again in a moment.";
        }
    }
}
