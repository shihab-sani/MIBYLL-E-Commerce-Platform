package online.shop.Repositories;

import online.shop.Entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Product> findByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    // NEW: flag-based
    List<Product> findByNewArrivalTrueAndActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    // kept for backward-compat (used nowhere now, safe to leave)
    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();

    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND (:categorySlug IS NULL OR p.category.slug = :categorySlug)
          AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
                          OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
    """)
    Page<Product> search(@Param("categorySlug") String categorySlug,
                         @Param("q") String q,
                         @Param("minPrice") java.math.BigDecimal minPrice,
                         @Param("maxPrice") java.math.BigDecimal maxPrice,
                         Pageable pageable);

    long countByStockQuantityLessThan(int threshold);
    List<Product> findTop8ByCategoryIdAndIdNotAndActiveTrue(UUID categoryId, UUID id);

}
