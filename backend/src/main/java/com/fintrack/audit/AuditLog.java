package com.fintrack.audit;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String action;
    @Column(nullable = false) private String entityType;
    private String entityId;
    private String actorName;
    private Long actorId;
    @Column(length = 1000) private String details;
    private String ipAddress;
    @CreatedDate @Column(updatable = false) private LocalDateTime createdAt;
}
