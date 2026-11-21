package online.shop.Repositories;

import online.shop.Entity.WishListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WishListRepository extends JpaRepository<WishListItem, UUID> {
    List<WishListItem> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<WishListItem> findByUserIdAndProductId(UUID userId, UUID productId);
}
