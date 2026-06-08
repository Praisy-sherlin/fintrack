package com.fintrack.audit;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

// ── Entity ────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    private String entityId;
    private String actorName;
    private Long   actorId;

    @Column(length = 1000)
    private String details;

    private String ipAddress;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime createdAt;
}

// ── Repository ────────────────────────────────────────────────────────────────
@Repository
interface AuditRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, org.springframework.data.domain.Pageable pageable);
    Page<AuditLog> findByActorIdOrderByCreatedAtDesc(Long actorId, org.springframework.data.domain.Pageable pageable);
}

// ── Service ───────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {

    private final AuditRepository repo;

    public void log(String action, String entityType, String entityId,
                    String actorName, Long actorId, String details) {
        repo.save(AuditLog.builder()
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .actorName(actorName)
            .actorId(actorId)
            .details(details)
            .build());
    }

    public Page<AuditLog> getAll(int page, int size) {
        return repo.findAll(PageRequest.of(page, size,
            org.springframework.data.domain.Sort.by("createdAt").descending()));
    }

    public Page<AuditLog> getByActor(Long actorId, int page, int size) {
        return repo.findByActorIdOrderByCreatedAtDesc(actorId, PageRequest.of(page, size));
    }
}
