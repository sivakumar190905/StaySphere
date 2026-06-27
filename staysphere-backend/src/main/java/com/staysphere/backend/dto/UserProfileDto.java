package com.staysphere.backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserProfileDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role; // 'customer' | 'partner' | 'staff' | 'admin'
    private boolean emailVerified;
    private String avatar;
}
