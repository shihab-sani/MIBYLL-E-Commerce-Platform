package online.shop.Repositories;

import online.shop.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByCartIdAndProductIdAndSize(UUID cartId, UUID productId, String size);
}
