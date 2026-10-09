package online.shop.DTOs;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogDtos {
    public record AuditLogDto(
            UUID id,
            String actorEmail,
            String actorRole,
            String action,
            String entityType,
            String entityId,
            String details,
            LocalDateTime createdAt
    ) {}
}
