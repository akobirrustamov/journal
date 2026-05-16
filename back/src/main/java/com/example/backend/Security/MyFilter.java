package com.example.backend.Security;

import com.example.backend.Repository.UserRepo;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@CrossOrigin
@Configuration
@RequiredArgsConstructor
public class MyFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepo userRepo;

    // 🔥 Extract REAL client IP
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For: clientIp, proxy1, proxy2 ...
            return ip.split(",")[0].trim();
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        return request.getRemoteAddr();  // fallback
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws IOException, ServletException {

        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        String realIp = getClientIp(request);

        System.out.println("==============================================");
        System.out.println("Method: " + method);
        System.out.println("Path:   " + requestPath);
        System.out.println("Client: " + realIp);
        System.out.println("==============================================");

        // Extract JWT token from Authorization header
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && !authHeader.isEmpty()) {
            try {
                String token = authHeader;

                // Validate token
                if (jwtService.validateToken(token)) {
                    // Extract user ID from token
                    String userId = jwtService.extractSubjectFromJwt(token);

                    // Load user from database
                    UserDetails userDetails = userRepo.findById(UUID.fromString(userId))
                            .orElse(null);

                    if (userDetails != null) {
                        // Create authentication token with user's authorities (roles)
                        UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                            );

                        // Set authentication in SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        System.out.println("✅ User authenticated: " + userDetails.getUsername());
                        System.out.println("✅ Roles: " + userDetails.getAuthorities());
                    }
                }
            } catch (ExpiredJwtException e) {
                System.out.println("❌ Token expired");
            } catch (Exception e) {
                System.out.println("❌ Token validation failed: " + e.getMessage());
            }
        }

        // ⚠️ IMPORTANT: Call next filter
        filterChain.doFilter(request, response);
    }
}
