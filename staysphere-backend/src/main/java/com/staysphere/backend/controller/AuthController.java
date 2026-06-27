package com.staysphere.backend.controller;

import com.staysphere.backend.dto.*;
import com.staysphere.backend.security.UserDetailsImpl;
import com.staysphere.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = userService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        UserProfileDto profile = userService.registerUser(registerRequest);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/partner/register")
    public ResponseEntity<?> registerPartner(@Valid @RequestBody PartnerRegisterRequest partnerRequest) {
        userService.registerPartnerRequest(partnerRequest);
        return ResponseEntity.ok(Map.of("message", "Partner registration request submitted successfully! Waiting for admin approval."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = userService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails != null) {
            userService.logoutUser(userDetails.getId());
            return ResponseEntity.ok(Map.of("message", "User logged out successfully!"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "No user session found"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails != null) {
            UserProfileDto profile = userService.getUserProfile(userDetails.getEmail());
            return ResponseEntity.ok(profile);
        }
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        userService.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "Password reset code sent successfully!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String password = request.get("password");
        userService.resetPassword(token, password);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully!"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        userService.verifyEmail(email, token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully!"));
    }

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        userService.sendVerificationEmail(email);
        return ResponseEntity.ok(Map.of("message", "Verification email sent successfully!"));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestBody java.util.Map<String, String> request) {
        if (userDetails != null) {
            UserProfileDto updated = userService.updateProfile(userDetails.getEmail(), request);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
}
