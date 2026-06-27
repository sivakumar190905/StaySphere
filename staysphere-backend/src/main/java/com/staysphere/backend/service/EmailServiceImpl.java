package com.staysphere.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    private void dispatchRealEmail(String to, String subject, String body) {
        if (mailSender == null || fromEmail == null || fromEmail.trim().isEmpty()) {
            logger.info("SMTP credentials not fully set. Falling back to log print.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true indicates HTML format
            mailSender.send(message);
            logger.info("Email successfully dispatched to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send real SMTP email to {}: {}. Log fallback initiated.", to, e.getMessage());
        }
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        String format = "\n" +
                "======================================================================\n" +
                "STAYSPHERE EMAIL DISPATCH SERVICE\n" +
                "======================================================================\n" +
                "TO:      {}\n" +
                "SUBJECT: {}\n" +
                "BODY:\n" +
                "{}\n" +
                "======================================================================\n";
        logger.info(format, to, subject, body);
        dispatchRealEmail(to, subject, body);
    }

    @Override
    public void sendPasswordResetCode(String to, String code) {
        String timestamp = java.time.LocalDateTime.now().toString().substring(0, 19);
        String format = "\n" +
                "======================================================================\n" +
                "EMAIL VERIFICATION\n" +
                "Recipient: {}\n" +
                "Verification Code: {}\n" +
                "Timestamp: {}\n" +
                "======================================================================\n";
        logger.info(format, to, code, timestamp);
        
        String htmlBody = "<h3>StaySphere Security Alert</h3>" +
                "<p>We received a request to reset your password. Use the verification code below to proceed:</p>" +
                "<h2 style='color:#6366F1; letter-spacing: 2px;'>" + code + "</h2>" +
                "<p>This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>";
        dispatchRealEmail(to, "Password Reset Code", htmlBody);
    }

    @Override
    public void sendEmailVerificationCode(String to, String code) {
        String timestamp = java.time.LocalDateTime.now().toString().substring(0, 19);
        String format = "\n" +
                "======================================================================\n" +
                "EMAIL VERIFICATION\n" +
                "Recipient: {}\n" +
                "Verification Code: {}\n" +
                "Timestamp: {}\n" +
                "======================================================================\n";
        logger.info(format, to, code, timestamp);

        String htmlBody = "<h3>Welcome to StaySphere!</h3>" +
                "<p>Thank you for registering. Please verify your email using the following registration OTP code:</p>" +
                "<h2 style='color:#6366F1; letter-spacing: 2px;'>" + code + "</h2>" +
                "<p>Verify your email to explore premium luxury hotel stays worldwide.</p>";
        dispatchRealEmail(to, "Email Verification OTP", htmlBody);
    }
}
