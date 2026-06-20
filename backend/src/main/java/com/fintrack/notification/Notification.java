package com.fintrack.notification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false) private String title;
    @Column(nullable = false, length = 500) private String body;
    @Enumerated(EnumType.STRING) @Builder.Default private NotificationType type = NotificationType.SYSTEM;
    @Builder.Default private boolean read = false;
    @CreatedDate @Column(updatable = false) private LocalDateTime createdAt;
}
