package com.fintrack.common;

import com.fintrack.auth.Role;
import com.fintrack.auth.User;
import com.fintrack.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
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
