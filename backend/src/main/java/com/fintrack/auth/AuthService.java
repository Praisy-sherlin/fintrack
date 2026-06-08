package com.fintrack.auth;

import com.fintrack.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isAccountNonLocked()) {
            throw new BadCredentialsException("Account is locked. Try again after " + user.getLockedUntil());
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            // Increment failed attempts
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
                log.warn("Account locked for user: {}", request.email());
            }
            userRepository.save(user);
            throw e;
        }

        // Reset failed attempts on success
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String accessToken  = jwtService.generateToken(Map.of("role", user.getRole().name()), user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Store refresh token in Redis (7 days)
        redisTemplate.opsForValue().set("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);

        return new AuthResponse(accessToken, refreshToken, toUserDto(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : Role.EMPLOYEE)
                .department(request.department())
                .build();

        user = userRepository.save(user);

        String accessToken  = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken, toUserDto(user));
    }

    public AuthResponse refreshToken(RefreshRequest request) {
        String email = jwtService.extractUsername(request.refreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String stored = redisTemplate.opsForValue().get("refresh:" + email);
        if (stored == null || !stored.equals(request.refreshToken())) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        String newAccessToken = jwtService.generateToken(Map.of("role", user.getRole().name()), user);
        return new AuthResponse(newAccessToken, request.refreshToken(), toUserDto(user));
    }

    public void logout(String token, String refreshToken) {
        // Blacklist access token in Redis until expiry
        redisTemplate.opsForValue().set("blacklist:" + token, "1", 15, TimeUnit.MINUTES);
        // Remove refresh token
        String email = jwtService.extractUsername(token);
        redisTemplate.delete("refresh:" + email);
    }

    private UserDto toUserDto(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.getDepartment(), user.getEmployeeId());
    }

    // ── Records / DTOs ──────────────────────────────────────────────
    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String name, String email, String password, Role role, String department) {}
    public record RefreshRequest(String refreshToken) {}
    public record LogoutRequest(String refreshToken) {}
    public record AuthResponse(String accessToken, String refreshToken, UserDto user) {}
    public record UserDto(Long id, String name, String email, String role, String department, String employeeId) {}
}
