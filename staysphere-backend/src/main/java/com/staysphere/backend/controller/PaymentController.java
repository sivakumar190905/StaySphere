package com.staysphere.backend.controller;

import com.staysphere.backend.service.RazorpayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private RazorpayService razorpayService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            double amount = Double.parseDouble(request.get("amount").toString());
            String receipt = request.containsKey("receipt") ? request.get("receipt").toString() : "rcpt_" + System.currentTimeMillis();
            
            Map<String, Object> order = razorpayService.createOrder(amount, receipt);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create Razorpay order: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> request) {
        String orderId = request.get("razorpay_order_id");
        String paymentId = request.get("razorpay_payment_id");
        String signature = request.get("razorpay_signature");

        boolean isValid = razorpayService.verifySignature(orderId, paymentId, signature);
        
        Map<String, String> response = new HashMap<>();
        if (isValid) {
            response.put("status", "success");
            response.put("message", "Payment verified successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "failed");
            response.put("message", "Invalid payment signature verification failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
