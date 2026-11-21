package online.shop.Repositories;

import online.shop.Entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductReviewRepository extends JpaRepository<ProductReview, UUID> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(UUID productId);
    boolean existsByProductIdAndUserId(UUID productId, UUID userId);
}
