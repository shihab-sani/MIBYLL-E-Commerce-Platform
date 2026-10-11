package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.AuditLogDtos.*;
import online.shop.Entity.AuditLog;
import online.shop.Repositories.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String actorEmail, String actorRole, String action,
                    String entityType, String entityId, String details) {
        if (actorEmail == null) return;
        auditLogRepository.save(AuditLog.builder()
                .actorEmail(actorEmail)
                .actorRole(actorRole == null ? "ROLE_ADMIN" : actorRole)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> list(int page, int size) {
        return auditLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(a -> new AuditLogDto(
                        a.getId(), a.getActorEmail(), a.getActorRole(),
                        a.getAction(), a.getEntityType(), a.getEntityId(),
                        a.getDetails(), a.getCreatedAt()));
    }
}
