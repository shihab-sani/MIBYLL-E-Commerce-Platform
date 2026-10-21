package online.shop.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_refund_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRefundLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private String action;

    @Column(length = 1000)
    private String reason;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
