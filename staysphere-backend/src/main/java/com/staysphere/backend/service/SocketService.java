package com.staysphere.backend.service;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class SocketService {

    @Autowired
    private SocketIOServer server;

    public void broadcastRoomAvailability(String roomId, int availableCount) {
        try {
            server.getBroadcastOperations().sendEvent("room_availability_update", Map.of(
                "roomId", roomId,
                "availableCount", availableCount
            ));
            System.out.println("Broadcasted availability for room " + roomId + " to " + availableCount);
        } catch (Exception e) {
            System.err.println("Failed to broadcast room availability: " + e.getMessage());
        }
    }
}
