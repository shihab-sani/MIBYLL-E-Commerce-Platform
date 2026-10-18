package online.shop.Repositories;

import online.shop.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    @Modifying
    @Query("UPDATE OrderItem o SET o.product = null WHERE o.product.id = :productId")
    void nullifyProductReference(@Param("productId") UUID productId);
}
