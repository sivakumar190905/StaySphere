package com.staysphere.backend.service;

import com.staysphere.backend.dto.*;

public interface UserService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    UserProfileDto registerUser(RegisterRequest registerRequest);
    TokenRefreshResponse refreshToken(TokenRefreshRequest request);
    void logoutUser(Long userId);
    UserProfileDto getUserProfile(String email);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    void verifyEmail(String email, String token);
    void sendVerificationEmail(String email);
    void registerPartnerRequest(PartnerRegisterRequest request);
    java.util.List<AdminUserDto> getAllUsersExceptAdmin();
    void createStaff(RegisterRequest registerRequest);
    void suspendUser(Long id);
    java.util.List<com.staysphere.backend.model.PartnerRequest> getPartnerRequests();
    void approvePartnerRequest(Long id);
    void rejectPartnerRequest(Long id);
    UserProfileDto updateProfile(String email, java.util.Map<String, String> updates);
}
