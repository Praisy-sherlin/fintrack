package com.fintrack.notification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.fintrack.auth.User;

import java.time.LocalDateTime;
import java.util.List;

// ── Enum ──────────────────────────────────────────────────────────────────────
enum NotificationType { PAYROLL, EXPENSE, LOAN, COMPLIANCE, EMPLOYEE, SYSTEM }

// ── Entity ────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String body;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private NotificationType type = NotificationType.SYSTEM;

    @Builder.Default
    private boolean read = false;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime createdAt;
}

// ── Repository ────────────────────────────────────────────────────────────────
@Repository
interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId")
    void markAllReadByUserId(Long userId);
}

// ── DTO ───────────────────────────────────────────────────────────────────────
record NotificationDto(Long id, String title, String body, String type,
                       boolean read, LocalDateTime createdAt) {}

// ── Service ───────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
class NotificationService {

    private final NotificationRepository repo;

    public List<NotificationDto> getAll(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    public NotificationDto markRead(Long id, Long userId) {
        Notification n = repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (n.getUserId().equals(userId)) {
            n.setRead(true);
            repo.save(n);
        }
        return toDto(n);
    }

    public void markAllRead(Long userId) {
        repo.markAllReadByUserId(userId);
    }

    public Notification send(Long userId, String title, String body, NotificationType type) {
        return repo.save(Notification.builder()
            .userId(userId).title(title).body(body).type(type).build());
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(n.getId(), n.getTitle(), n.getBody(),
            n.getType().name(), n.isRead(), n.getCreatedAt());
    }
}

// ── Controller ────────────────────────────────────────────────────────────────
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
    public ResponseEntity<NotificationDto> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.markRead(id, user.getId()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        service.markAllRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}
