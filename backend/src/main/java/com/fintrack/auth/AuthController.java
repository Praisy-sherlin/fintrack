package com.fintrack.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthService.AuthResponse> login(
            @RequestBody AuthService.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthService.AuthResponse> register(
            @RequestBody AuthService.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthService.AuthResponse> refresh(
            @RequestBody AuthService.RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AuthService.LogoutRequest request) {
        String token = authHeader.substring(7);
        authService.logout(token, request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthService.UserDto> profile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new AuthService.UserDto(
                user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.getDepartment(), user.getEmployeeId()
        ));
    }
}
