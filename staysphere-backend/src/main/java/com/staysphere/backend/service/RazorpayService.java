package com.staysphere.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class RazorpayService {

    @Value("${app.razorpay.key-id:}")
    private String keyId;

    @Value("${app.razorpay.key-secret:}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() {
        if (keyId != null && !keyId.trim().isEmpty() && !"rzp_test_dummykey".equals(keyId) &&
            keySecret != null && !keySecret.trim().isEmpty() && !"dummysecret".equals(keySecret)) {
            try {
                this.client = new RazorpayClient(keyId.trim(), keySecret.trim());
            } catch (Exception e) {
                System.out.println("ERROR: Failed to initialize RazorpayClient: " + e.getMessage());
            }
        }
    }

    public Map<String, Object> createOrder(double amountInRupees, String bookingId) throws Exception {
        int amountInPaise = (int) Math.round(amountInRupees * 100);
        
        if (client == null) {
            System.out.println("WARNING: Razorpay client is not configured. Returning local mock order details.");
            Map<String, Object> mockOrder = new HashMap<>();
            mockOrder.put("id", "order_mock_" + (int)(100000 + Math.random() * 900000));
            mockOrder.put("amount", amountInPaise);
            mockOrder.put("currency", "INR");
            mockOrder.put("receipt", bookingId);
            mockOrder.put("status", "created");
            return mockOrder;
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", bookingId);
        
        Order order = client.orders.create(orderRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", order.get("id").toString());
        response.put("amount", (Integer) order.get("amount"));
        response.put("currency", order.get("currency").toString());
        response.put("receipt", order.get("receipt").toString());
        response.put("status", order.get("status").toString());
        return response;
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (client == null || (orderId != null && orderId.startsWith("order_mock_"))) {
            return true;
        }
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);
            
            return Utils.verifyPaymentSignature(attributes, keySecret.trim());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
