package com.fintrack.notification;
import java.time.LocalDateTime;
public record NotificationDto(Long id, String title, String body, String type, boolean read, LocalDateTime createdAt) {}
