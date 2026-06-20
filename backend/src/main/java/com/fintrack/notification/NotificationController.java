package com.fintrack.notification;

import com.fintrack.auth.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getAll(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.markRead(id, user.getId()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        service.markAllRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}
