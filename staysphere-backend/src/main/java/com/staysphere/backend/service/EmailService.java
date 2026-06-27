package com.staysphere.backend.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
    void sendPasswordResetCode(String to, String code);
    void sendEmailVerificationCode(String to, String code);
}
