package com.staysphere.backend.config;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SocketIOServerRunner implements CommandLineRunner {

    @Autowired
    private SocketIOServer server;

    @Override
    public void run(String... args) throws Exception {
        try {
            server.start();
            System.out.println("Socket.io Server started successfully on port 9092.");
        } catch (Exception e) {
            System.err.println("Failed to start Socket.io server: " + e.getMessage());
        }

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                server.stop();
                System.out.println("Socket.io Server stopped successfully.");
            } catch (Exception e) {
                System.err.println("Failed to stop Socket.io server: " + e.getMessage());
            }
        }));
    }
}
