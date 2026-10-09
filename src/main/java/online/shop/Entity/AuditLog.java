package online.shop.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_actor", columnList = "actorEmail"),
        @Index(name = "idx_audit_created", columnList = "createdAt")
})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String actorEmail;

    @Column(nullable = false)
    private String actorRole;

    /** Human-readable action, e.g. "PRODUCT_CREATED", "ORDER_STATUS_CHANGED" */
    @Column(nullable = false)
    private String action;

    /** e.g. "PRODUCT", "CATEGORY", "ORDER", "USER" */
    private String entityType;

    private String entityId;

    @Column(length = 2000)
    private String details;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
