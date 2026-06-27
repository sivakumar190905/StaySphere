package com.staysphere.backend.controller;

import com.staysphere.backend.dto.AdminUserDto;
import com.staysphere.backend.dto.RegisterRequest;
import com.staysphere.backend.model.PartnerRequest;
import com.staysphere.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersExceptAdmin());
    }

    @PostMapping("/users/staff")
    public ResponseEntity<?> createStaff(@Valid @RequestBody RegisterRequest registerRequest) {
        userService.createStaff(registerRequest);
        return ResponseEntity.ok(Map.of("message", "Staff account created successfully!"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> suspendUser(@PathVariable Long id) {
        userService.suspendUser(id);
        return ResponseEntity.ok(Map.of("message", "User suspended successfully!"));
    }

    @GetMapping("/partner-requests")
    public ResponseEntity<List<PartnerRequest>> getPartnerRequests() {
        return ResponseEntity.ok(userService.getPartnerRequests());
    }

    @PutMapping("/partner-requests/{id}/approve")
    public ResponseEntity<?> approvePartnerRequest(@PathVariable Long id) {
        userService.approvePartnerRequest(id);
        return ResponseEntity.ok(Map.of("message", "Partner request approved and account created successfully!"));
    }

    @PutMapping("/partner-requests/{id}/reject")
    public ResponseEntity<?> rejectPartnerRequest(@PathVariable Long id) {
        userService.rejectPartnerRequest(id);
        return ResponseEntity.ok(Map.of("message", "Partner request rejected successfully!"));
    }
}
