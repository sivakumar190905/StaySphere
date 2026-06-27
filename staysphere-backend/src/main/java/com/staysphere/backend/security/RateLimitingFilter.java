package com.staysphere.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, RequestLimit> ipRequestCounts = new ConcurrentHashMap<>();
    
    private static final int MAX_REQUESTS_PER_MINUTE = 300; 

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String ipAddress = request.getRemoteAddr();
        long currentTimeMillis = System.currentTimeMillis();
        RequestLimit limit = ipRequestCounts.computeIfAbsent(ipAddress, ip -> new RequestLimit(currentTimeMillis));
        
        if (currentTimeMillis - limit.windowStartTime > 60000) {
            limit.windowStartTime = currentTimeMillis;
            limit.requestCount.set(1);
        } else {
            int requests = limit.requestCount.incrementAndGet();
            if (requests > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Maximum " + MAX_REQUESTS_PER_MINUTE + " requests per minute allowed.\"}");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    private static class RequestLimit {
        long windowStartTime;
        final AtomicInteger requestCount = new AtomicInteger(0);
        
        RequestLimit(long start) {
            this.windowStartTime = start;
        }
    }
}
