package online.shop.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "request_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private CustomerRequest request;

    @Column(nullable = false)
    private String senderRole; // "CUSTOMER" or "ADMIN"

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean readByCustomer = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean readByAdmin = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
