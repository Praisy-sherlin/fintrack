package com.fintrack.common;

import com.fintrack.auth.Role;
import com.fintrack.auth.User;
import com.fintrack.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

// ── UserDetailsService ────────────────────────────────────────────────────────
@Configuration
@RequiredArgsConstructor
class UserDetailsConfig {

    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}

// ── Global Exception Handler ──────────────────────────────────────────────────
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(IllegalStateException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(Exception ex) {
        return error(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(Exception ex) {
        return error(HttpStatus.FORBIDDEN, "Access denied");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status",    status.value(),
            "message",   message != null ? message : "Unknown error"
        ));
    }
}

// ── Data Initializer ──────────────────────────────────────────────────────────
@Component
@RequiredArgsConstructor
class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed default users if not present
        seedUser("Admin User",    "admin@fintrack.com",    "Admin@123",    Role.ADMIN,    "Finance");
        seedUser("Finance Mgr",   "manager@fintrack.com",  "Manager@123",  Role.MANAGER,  "Finance");
        seedUser("John Employee", "employee@fintrack.com", "Employee@123", Role.EMPLOYEE, "Engineering");
        seedUser("Audit User",    "auditor@fintrack.com",  "Auditor@123",  Role.AUDITOR,  "Compliance");
    }

    private void seedUser(String name, String email, String password, Role role, String dept) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(User.builder()
                .name(name).email(email)
                .password(passwordEncoder.encode(password))
                .role(role).department(dept).enabled(true)
                .build());
        }
    }
}