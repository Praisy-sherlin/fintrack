package com.fintrack.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {
    private final AuditRepository repo;

    public void log(String action, String entityType, String entityId, String actorName, Long actorId, String details) {
        repo.save(AuditLog.builder().action(action).entityType(entityType).entityId(entityId)
            .actorName(actorName).actorId(actorId).details(details).build());
    }

    public Page<AuditLog> getAll(int page, int size) {
        return repo.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public Page<AuditLog> getByActor(Long actorId, int page, int size) {
        return repo.findByActorIdOrderByCreatedAtDesc(actorId, PageRequest.of(page, size));
    }
}
