package com.staysphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;
    private final String type = "Bearer";
    private Long id;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatar;
}
