package online.shop.Repositories;

import online.shop.Entity.OrderRefundLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderRefundLogRepository extends JpaRepository<OrderRefundLog, UUID> {
}
