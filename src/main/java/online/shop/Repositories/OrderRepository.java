package online.shop.Repositories;

import online.shop.Entity.Order;
import online.shop.Entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(OrderStatus status);
}
