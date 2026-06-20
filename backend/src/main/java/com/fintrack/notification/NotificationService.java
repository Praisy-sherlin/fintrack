package com.fintrack.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationRepository repo;

    public List<NotificationDto> getAll(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    public NotificationDto markRead(Long id, Long userId) {
        Notification n = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (n.getUserId().equals(userId)) { n.setRead(true); repo.save(n); }
        return toDto(n);
    }

    public void markAllRead(Long userId) { repo.markAllReadByUserId(userId); }

    public Notification send(Long userId, String title, String body, NotificationType type) {
        return repo.save(Notification.builder().userId(userId).title(title).body(body).type(type).build());
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(n.getId(), n.getTitle(), n.getBody(), n.getType().name(), n.isRead(), n.getCreatedAt());
    }
}
